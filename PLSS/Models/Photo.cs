using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Text.RegularExpressions;
using System.Web;
using O2S.Components.PDF4NET;
using PLSS.Models.ViewModel;
using PLSS.Services;
using PLSS.Services.Pdf;

namespace PLSS.Models
{
    public class Photo
    {
        private readonly ImageService _imageService;
        private readonly BasicPdfService _pdfService;

        public Photo()
        {
            
        }

        public Photo(CornerViewModel model)
        {
            _imageService = new ImageService();
            _pdfService = new BasicPdfService();

            PhotoId = Guid.NewGuid();

            Sketch = ReadFully(model.Sketch);
            Thumb = ReadFully(model.Thumb);
            Thumb2 = ReadFully(model.Thumb2);
            ExtraPages = ProcessExtraPages(model.Files);
        }

        public Guid PhotoId { get; set; }
        public byte[] Sketch { get; set; }
        public byte[] Thumb { get; set; }
        public byte[] Thumb2 { get; set; }
        public byte[] ExtraPages { get; set; }

        private static byte[] ReadFully(HttpPostedFileBase file)
        {
            if (file == null)
            {
                return null;
            }

            using (var ms = new MemoryStream())
            {
                file.InputStream.CopyTo(ms);
                return ms.ToArray();
            }
        }

        private byte[] ProcessExtraPages(IEnumerable<HttpPostedFileBase> files)
        {
            var pdfStreams = new List<Stream>();
            if (files == null)
            {
                return null;
            }

            foreach (var file in files)
            {
                AcceptableFileTypes type;

                if (file == null || file.ContentLength <= 0 || !IsValidExtension(file.FileName, out type))
                {
                    continue;
                }

                if (type == AcceptableFileTypes.Pdf)
                {
                    pdfStreams.Add(file.InputStream);
                    continue;
                }

                var doc = new PDFDocument();
                var page = doc.AddPage();
                var image = Image.FromStream(file.InputStream);
                var widthPixels = page.Width;
                var heightPixels = page.Height;

                if (image.Height <= image.Width && image.Width > widthPixels)
                {
                    //landscape
                    image.RotateFlip(RotateFlipType.Rotate90FlipNone);

                    var newWidth = image.Width / (image.Height / heightPixels);
                    var size = new ImageSize((int)newWidth, (int)heightPixels);

                    var resizeStream = new MemoryStream(_imageService.CreateSizedImage(image, size));

                    var newImage = Image.FromStream(resizeStream);
                    page.Canvas.DrawImage(newImage, 0, 0, newImage.Width, newImage.Height);
                }
                else if (image.Height > image.Width && image.Height > heightPixels)
                {
                    //portrait
                    var newWidth = image.Width / (image.Height / heightPixels);
                    var size = new ImageSize((int)newWidth, (int)heightPixels);

                    var resizeStream = new MemoryStream(_imageService.CreateSizedImage(image, size));

                    var newImage = Image.FromStream(resizeStream);
                    page.Canvas.DrawImage(newImage, 0, 0, newImage.Width, newImage.Height);
                }
                else
                {
                    page.Canvas.DrawImage(image, 0, 0, image.Width, image.Height);
                }

                Stream stream = new MemoryStream();
                doc.SaveToStream(stream);

                pdfStreams.Add(stream);

                image.Dispose();
            }

            if (pdfStreams.Count > 0)
            {
                var document = _pdfService.MergePdfDocs(pdfStreams);
                var bytes = document.GetPDFAsByteArray();

                foreach (var stream in pdfStreams)
                {
                    stream.Dispose();
                }

                return bytes;
            }

            return null;
        }

        public bool IsValidExtension(string filename, out AcceptableFileTypes type)
        {
            var re = new Regex(".(pdf)$|.(jpg)$|.(bmp)$|.(gif)$|.(png)$", RegexOptions.IgnoreCase);

            var match = re.Match(filename);

            switch (match.Groups[1].Value)
            {
                case "pdf":
                    type = AcceptableFileTypes.Pdf;
                    break;
                default:
                    type = AcceptableFileTypes.Other;
                    break;
            }

            return match.Success;
        }

        public static string InsertString
        {
            get
            {
                return "insert into Photos(PhotoId, Sketch, Thumb, Thumb2, ExtraPages) " +
                       "values (@photoid, @sketch, @thumb, @thumb2, @extrapages)";
            }
        }
    }
}