using System;
using System.Drawing;
using System.Web;
using AutoMapper;
using NLog;
using PLSS.Models.ViewModel;
using PLSS.Services;

namespace PLSS.Models
{
    public class TieSheetPdfModel
    {
        private static readonly Logger Log = LogManager.GetCurrentClassLogger();
        private string _accuracy;

        public TieSheetPdfModel(CornerViewModel model, Corner corner, Photo photo)
        {
            var imageService = new ImageService();
            const int factor = 2;

            OverrideTitle = model.UseCountyTitle;

            County = corner.County;
            BlmPointId = corner.BlmPointId;
            CollectionDate = corner.CollectionDate.ToShortDateString();
            SectionCorner = corner.SectionCorner;
            Township = corner.Township;
            BaseMeridian = corner.BaseMeridian;
            Accuracy = corner.Accuracy;
            Description = corner.Description;
            MonumentStatus = corner.MonumentStatus;
            SurveryorLicenseNumber = model.User.SurveryorLicenseNumber;
            SurveyorName = model.User.Name;

            Zone = model.Grid.Zone;
            Northing = model.Grid.Northing.ToString("0.000");
            Easting = model.Grid.Easting.ToString("0.000");
            Elevation = model.Grid.Elevation.ToString("0.000");
            CoordinateAdjustment = model.Grid.Adjustment;
            CoordinateSystem = model.Grid.CoordinateSystem;
            Datum = model.Grid.Datum;

            Latitude = string.Format("{0}°{1}'{2}\" {3}", model.Coordinate.NorthingDegrees,
                                     model.Coordinate.NorthingMinutes,
                                     model.Coordinate.NorthingSeconds,
                                     model.Coordinate.Northing);
            Longitude = string.Format("{0}°{1}'{2}\" {3}", model.Coordinate.EastingDegrees,
                                      model.Coordinate.EastingMinutes,
                                      model.Coordinate.EastingSeconds,
                                      model.Coordinate.Easting);
            ElipsoidHeight = model.Coordinate.ElipsoidHeight.ToString("0.000");
            GridAdjustment = model.Coordinate.Adjustment;

            var sketch = ConvertToImage(model.Sketch);
            if (sketch != null)
            {
                Sketch = imageService.CreateSizedImage(sketch, new ImageSize(height: 270*factor, width: 357*factor));
            }

            var thumb = ConvertToImage(model.Thumb);
            if (thumb != null)
            {
                Thumb = imageService.CreateSizedImage(thumb, new ImageSize(height: 270*factor, width: 357*factor));
            }

            var thumb2 = ConvertToImage(model.Thumb2);
            if (thumb2 != null)
            {
                Thumb2 = imageService.CreateSizedImage(thumb2, new ImageSize(height: 270*factor, width: 357*factor));
            }

            var extras = photo.ExtraPages;
            if (extras != null)
            {
                ExtraPages = extras;
            }

            if(model.User.SurveyorSeal != null && model.User.SurveyorSeal.Length > 0)
            {
                SurveyorSeal = model.User.SurveyorSeal;
            }
        }

        public bool OverrideTitle { get; set; }

        public string County { get; set; }

        public bool HasPhotos { get; set; }

        public byte[] Sketch { get; set; }

        public byte[] SurveyorSeal { get; set; }

        public byte[] ExtraPages { get; set; }

        public byte[] Thumb2 { get; set; }

        public byte[] Thumb { get; set; }

        public string BlmPointId { get; set; }

        public string CollectionDate { get; set; }

        public string SectionCorner { get; set; }

        public string Township { get; set; }

        public string BaseMeridian { get; set; }

        //"Accuracy: " + model.Accuracy + ". " + model.Notes ?? ""
        public string Accuracy
        {
            get
            {
                if (string.IsNullOrEmpty(_accuracy)) return "";

                return string.Format("Accuracy: {0}.", _accuracy);
            }
            set { _accuracy = value; }
        }

        public string Description { get; set; }

        public string MonumentStatus { get; set; }

        public string SurveryorLicenseNumber { get; set; }

        public string SurveyorName { get; set; }

        public string Latitude { get; set; }

        public string Longitude { get; set; }

        public string Zone { get; set; }

        public string Northing { get; set; }

        public string Easting { get; set; }

        public string Elevation { get; set; }

        public string CoordinateAdjustment { get; set; }

        public string CoordinateSystem { get; set; }

        public string ElipsoidHeight { get; set; }

        public string GridAdjustment { get; set; }

        public string Datum { get; set; }

        private static Image ConvertToImage(HttpPostedFileBase file)
        {
            if (file == null || file.ContentLength < 1)
            {
                return null;
            }

            Image image;
            try
            {
                image = Image.FromStream(file.InputStream);
            }
            catch (Exception ex)
            {
                Log.Info("file name: {0}, file size: {1}, file type: {2}", file.FileName, file.ContentLength, file.ContentType);
                Log.FatalException("Error Converting posted file to an image", ex);

                return null;
            }

            return image;
        }
    }
}