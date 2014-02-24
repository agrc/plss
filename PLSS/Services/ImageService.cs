using System.Drawing;
using System.Drawing.Imaging;
using System.IO;

namespace PLSS.Services
{
    public class ImageService
    {
        /// <summary>
        /// Creates a main and thumnail image from the given image of the taget size
        /// </summary>
        /// <param name="image">The image.</param>
        /// <param name="targetSize">Size of the target.</param>
        public byte[] CreateSizedImage(Image image, ImageSize targetSize)
        {
            if (image != null)
            {
                using (image)
                {
                    var imageComparer = new ImageComparer(image, targetSize);

                    var newImageSize = imageComparer.IsLandscape ? imageComparer.LandscapeSize : imageComparer.PortraitSize;

                    using (var bitmap = new Bitmap(newImageSize.Width, newImageSize.Height, PixelFormat.Format24bppRgb))
                    {
                        bitmap.SetResolution(image.HorizontalResolution, image.VerticalResolution);
                        using (var graphics = Graphics.FromImage(bitmap))
                        {
                            graphics.InterpolationMode = System.Drawing.Drawing2D.InterpolationMode.HighQualityBicubic;
                            graphics.DrawImage(image,
                                new Rectangle(0, 0, newImageSize.Width, newImageSize.Height),
                                new Rectangle(0, 0, image.Width, image.Height),
                                GraphicsUnit.Pixel);
                        }

                        using (var input = new MemoryStream())
                        {
                            bitmap.Save(input, ImageFormat.Jpeg);

                            return input.ToArray();
                        }
                    }
                }
            }

            return null;
        }
    }

    public class ImageSize
    {
        public int Width { get; private set; }
        public int Height { get; private set; }

        public ImageSize(int width, int height)
        {
            Width = width;
            Height = height;
        }
    }

    public class ImageComparer
    {
        readonly Image _sourceImage;
        readonly ImageSize _targetSize;

        public ImageComparer(Image sourceImage, ImageSize targetSize)
        {
            _sourceImage = sourceImage;
            _targetSize = targetSize;
        }

        public float WidthRatio { get { return _targetSize.Width / (float)_sourceImage.Width; } }
        public float HeightRatio { get { return _targetSize.Height / (float)_sourceImage.Height; } }
        public bool IsLandscape { get { return HeightRatio >= WidthRatio; } }

        public ImageSize LandscapeSize
        {
            get
            {
                return new ImageSize((int)(_sourceImage.Width * WidthRatio), (int)(_sourceImage.Height * WidthRatio));
            }
        }

        public ImageSize PortraitSize
        {
            get
            {
                return new ImageSize((int)(_sourceImage.Width * HeightRatio), (int)(_sourceImage.Height * HeightRatio));
            }
        }
    }
}