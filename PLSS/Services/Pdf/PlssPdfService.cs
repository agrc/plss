using System;
using System.Drawing;
using System.IO;
using O2S.Components.PDF4NET;
using O2S.Components.PDF4NET.Graphics;
using O2S.Components.PDF4NET.Graphics.Fonts;
using O2S.Components.PDF4NET.Graphics.Shapes;
using PLSS.Models;

namespace PLSS.Services.Pdf
{
    public class PlssPdfService : PdfServiceBase
    {
        private const string HeaderName = @"Assets\Pdf\StateOfUtah-Header.jpg";
        private const string FontName = @"Assets\Pdf\TrajanPro-Regular.otf";
        private readonly string _basePath;
        private string _fontPath;
        private string _headerImagePath;
        private readonly string _baseDirectory;

        public PlssPdfService(string basePath)
        {
            _basePath = basePath;
            _baseDirectory = AppDomain.CurrentDomain.BaseDirectory;
        }

        public string FontPath
        {
            get
            {
                var baseDirectory = _fontPath;
               
                if (string.IsNullOrEmpty(baseDirectory))
                {
                    baseDirectory = _baseDirectory;
                }
                 
               return Path.Combine(baseDirectory, FontName);
            }
            set { _fontPath = value; }
        }

        public string HeaderImagePath
        {
            get
            {
                var baseDirectory = _headerImagePath;

                if (string.IsNullOrEmpty(baseDirectory))
                {
                    baseDirectory = _baseDirectory;
                }

                return Path.Combine(baseDirectory, HeaderName);
            }
            set { _headerImagePath = value; }
        }

        public override PDFDocument GetPdfForm(string file)
        {
            file = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, _basePath, file);

            return base.GetPdfForm(file);
        }

        public PDFDocument HydratePdfForm(string path, TieSheetPdfModel model)
        {
            var pdfDoc = GetPdfForm(path);
            return HydratePdfForm(pdfDoc, model);
        }

        public override PDFDocument HydratePdfForm(PDFDocument template, params object[] args)
        {
            foreach (var thing in args)
            {
                var model = thing as TieSheetPdfModel;
                if (model == null)
                {
                    continue;
                }

                var canvas = template.Pages[0].Canvas;
                var center = template.PageWidth/2;

                if (model.OverrideTitle)
                {
                    var titleFont = new TrueTypeFont(FontPath, 39, true, true);
                    var subFont = new TrueTypeFont(FontPath, 25, true, true);

                    var pen = new PDFPen(new PDFColor(0));
                    var brush = new PDFBrush(new PDFColor(0));

                    canvas.DrawText(model.County + " County", titleFont, pen, brush, center, 17, 0,
                                    TextAlign.MiddleCenter);
                    canvas.DrawText("Monument Record Sheet", subFont, pen, brush, center, 55, 0, TextAlign.MiddleCenter);
                }
                else
                {
                    if (File.Exists(HeaderImagePath))
                    {
                        var header = Image.FromFile(HeaderImagePath);
                        canvas.DrawImage(header, 36, 0, 528, 71);
                    }
                }

                if (model.Sketch != null)
                {
                    var msSketch = new MemoryStream(model.Sketch);
                    var sketch = Image.FromStream(msSketch);
                    canvas.DrawImage(sketch, 217, 115, 359, 272);
                }

                if (model.Thumb != null)
                {
                    var msThumb = new MemoryStream(model.Thumb);
                    var thumb = Image.FromStream(msThumb);
                    canvas.DrawImage(thumb, 217, 399, 179, 134);
                }

                if (model.Thumb2 != null)
                {
                    var msThumb2 = new MemoryStream(model.Thumb2);
                    var thumb2 = Image.FromStream(msThumb2);
                    canvas.DrawImage(thumb2, 397, 399, 179, 134);
                }

                if (model.ExtraPages != null)
                {
                    var stream = new MemoryStream(model.ExtraPages);
                    var doc = new PDFDocument(stream);

                    foreach (PDFPage page in doc.Pages)
                    {
                        template.AddPage(page);
                    }
                }

                if (model.SurveyorSeal != null)
                {
                    var sealStream = new MemoryStream(model.SurveyorSeal);
                    var image = Image.FromStream(sealStream);

                    canvas.DrawImage(image, 431, 648, 143, 113);
                }

                template.WriteToPdfTextField("BLMPointName", model.BlmPointId);
                template.WriteToPdfTextField("Date", model.CollectionDate);
                template.WriteToPdfTextField("CornerOfSection", model.SectionCorner);
                template.WriteToPdfTextField("Township", model.Township);
                template.WriteToPdfTextField("BaseMeridian", model.BaseMeridian);
                template.WriteToPdfTextField("State", "Utah");
                template.WriteToPdfTextField("County", model.County);
                template.WriteToPdfTextField("Datum", model.Datum);
                template.WriteToPdfTextField("Notes", model.Accuracy);
                template.WriteToPdfTextField("Description", model.Description);
                template.WriteToPdfTextField("Status", model.MonumentStatus);
                template.WriteToPdfTextField("LicenseNumber", model.SurveryorLicenseNumber);
                template.WriteToPdfTextField("ContactName", model.SurveyorName);

                template.WriteToPdfTextField("CoordinateSystem", model.CoordinateSystem);
                template.WriteToPdfTextField("Zone", model.Zone);
                template.WriteToPdfTextField("Northing", model.Northing);
                template.WriteToPdfTextField("Easting", model.Easting);
                template.WriteToPdfTextField("OrthoHeight", model.Elevation);
                template.WriteToPdfTextField("NGSAdjustment", model.CoordinateAdjustment);
                template.WriteToPdfTextField("VerticalUnits", "meters");
                template.WriteToPdfTextField("HorizontalUnits", "meters");
                template.WriteToPdfTextField("VerticalDatum", "NAVD88");

                template.WriteToPdfTextField("Latitude", model.Latitude);
                template.WriteToPdfTextField("Longitude", model.Longitude);
                template.WriteToPdfTextField("EllipsoidHeight", model.ElipsoidHeight);
                template.WriteToPdfTextField("NGSAdjustment", model.GridAdjustment);
            }

            return template;
        }

        public PDFDocument RebuildPdfFrom(string path, Photo photo, User user, Corner corner, Grid grid, Coordinate cord)
        {
            var template = GetPdfForm(path);

            var canvas = template.Pages[0].Canvas;

            if (File.Exists(HeaderImagePath))
            {
                var header = Image.FromFile(HeaderImagePath);
                canvas.DrawImage(header, 36, 0, 528, 71);
            }

            if (photo.Sketch != null)
            {
                var msSketch = new MemoryStream(photo.Sketch);
                var sketch = Image.FromStream(msSketch);
                canvas.DrawImage(sketch, 217, 115, 359, 272);
            }

            if (photo.Thumb != null)
            {
                var msThumb = new MemoryStream(photo.Thumb);
                var thumb = Image.FromStream(msThumb);
                canvas.DrawImage(thumb, 217, 399, 179, 134);
            }

            if (photo.Thumb2 != null)
            {
                var msThumb2 = new MemoryStream(photo.Thumb2);
                var thumb2 = Image.FromStream(msThumb2);
                canvas.DrawImage(thumb2, 397, 399, 179, 134);
            }

            if (photo.ExtraPages != null)
            {
                var stream = new MemoryStream(photo.ExtraPages);
                var doc = new PDFDocument(stream);

                foreach (PDFPage page in doc.Pages)
                {
                    template.AddPage(page);
                }
            }

            if (user.SurveyorSeal != null)
            {
                var sealStream = new MemoryStream(user.SurveyorSeal);
                var image = Image.FromStream(sealStream);

                canvas.DrawImage(image, 431, 648, 143, 113);
            }

            template.WriteToPdfTextField("BLMPointName", corner.BlmPointId);
            template.WriteToPdfTextField("Date", corner.CollectionDate.ToShortDateString());
            template.WriteToPdfTextField("CornerOfSection", corner.SectionCorner);
            template.WriteToPdfTextField("Township", corner.Township);
            template.WriteToPdfTextField("BaseMeridian", corner.BaseMeridian);
            template.WriteToPdfTextField("State", "Utah");
            template.WriteToPdfTextField("County", corner.County);
            template.WriteToPdfTextField("Datum", grid.Datum);
            template.WriteToPdfTextField("Notes", corner.Accuracy);
            template.WriteToPdfTextField("Description", corner.Description);
            template.WriteToPdfTextField("Status", corner.MonumentStatus);
            template.WriteToPdfTextField("LicenseNumber", user.SurveryorLicenseNumber);
            template.WriteToPdfTextField("ContactName", user.Name);

            template.WriteToPdfTextField("CoordinateSystem", grid.Datum);
            template.WriteToPdfTextField("Zone", grid.Zone);
            template.WriteToPdfTextField("Northing", grid.Northing.ToString("0.000"));
            template.WriteToPdfTextField("Easting", grid.Easting.ToString("0.000"));
            template.WriteToPdfTextField("OrthoHeight", grid.Elevation.ToString("0.000"));
            template.WriteToPdfTextField("NGSAdjustment", grid.Adjustment);
            template.WriteToPdfTextField("VerticalUnits", "meters");
            template.WriteToPdfTextField("HorizontalUnits", "meters");
            template.WriteToPdfTextField("VerticalDatum", "NAVD88");

            template.WriteToPdfTextField("Latitude", string.Format("{0}°{1}'{2}\" {3}", cord.NorthingDegrees,
                                     cord.NorthingMinutes,
                                     cord.NorthingSeconds,
                                     cord.Northing));
            template.WriteToPdfTextField("Longitude", string.Format("{0}°{1}'{2}\" {3}", cord.EastingDegrees,
                                      cord.EastingMinutes,
                                      cord.EastingSeconds,
                                      cord.Easting));
            template.WriteToPdfTextField("EllipsoidHeight", cord.ElipsoidHeight.ToString("0.000"));
            template.WriteToPdfTextField("NGSAdjustment", cord.Adjustment);

            return template;
        }
    }
}