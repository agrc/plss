using System;
using System.IO;
using System.Net;
using PLSS.Extensions;

namespace PLSS.Services.Ftp
{
    public abstract class FtpServiceBase : IFtpService
    {
        protected Uri FtpUri;
        protected string FtpUser;
        protected string Password;

        public FtpStatusCode Upload(byte[] buffer, string path, out string actualPath)
        {
            var folder = Path.GetDirectoryName(path);
            var directoryUri = FtpUri.Combine(folder);
            CreateDirectory(directoryUri);

            var fullPath = FtpUri.Combine(path);
            var uniqueFileName = CheckForCollisionsAndRename(fullPath);

            var request = CreateRequest(uniqueFileName);
            request.Method = WebRequestMethods.Ftp.UploadFile;

            using (var reqStream = request.GetRequestStream())
            {
                reqStream.Write(buffer, 0, buffer.Length);
                reqStream.Close();
            }

            using (var response = request.GetResponse() as FtpWebResponse)
            {
                actualPath = uniqueFileName.AbsolutePath;
                return response.StatusCode;
            }
        }

        public Stream Download(string id, out string fileName)
        {
            throw new NotImplementedException();
        }

        public FtpStatusCode Delete(string id, string path)
        {
            //delete the file from the ftp server
            var request = CreateRequest(FtpUri.Combine(path));
            request.Method = WebRequestMethods.Ftp.DeleteFile;

            using (var response = request.GetResponse() as FtpWebResponse)
            {
                return response.StatusCode;
            }
        }

        public virtual FtpWebRequest CreateRequest(Uri uri)
        {
            var request = (FtpWebRequest) WebRequest.Create(uri);

            return HydrateRequest(request);
        }

        public virtual FtpWebRequest CreateRequest(string uri)
        {
            FtpWebRequest request;

            if (uri.StartsWith("/"))
            {
                uri = uri.Remove(uri.IndexOf('/'), 1);
                var relativeUri = new Uri(uri, UriKind.Relative);

                request = (FtpWebRequest) WebRequest.Create(relativeUri);
            }
            else
            {
                request = (FtpWebRequest) WebRequest.Create(uri);
            }

            return HydrateRequest(request);
        }

        private FtpWebRequest HydrateRequest(FtpWebRequest request)
        {
            request.Credentials = new NetworkCredential(FtpUser, Password);
            request.UseBinary = true;
            request.UsePassive = true;
            request.KeepAlive = false;
            request.EnableSsl = false;

            return request;
        }

        private void CreateDirectory(Uri directoryUri)
        {
            //UserCommittedTieSheets/Steve%20Gourley/26T9SR10WSec10
            var folders = directoryUri.AbsolutePath.Split("/".ToCharArray(), StringSplitOptions.RemoveEmptyEntries);
            for (var i = 0; i < folders.Length; i++)
            {
                var folder = string.Join("/", folders, 0, i + 1);

                var uri = string.Join("/", directoryUri.Scheme + ":/", directoryUri.Host, folder);
                var request = CreateRequest(uri);

                try
                {
                    request.Method = WebRequestMethods.Ftp.MakeDirectory;
                    using (var response = request.GetResponse() as FtpWebResponse)
                    {
                        if (response.StatusCode != FtpStatusCode.PathnameCreated)
                        {
                        }
                    }
                }
                catch
                {
                }
            }
        }

        private Uri CheckForCollisionsAndRename(Uri path)
        {
            var exists = true;

            var i = 2;
            var fileNameSansExtension = Path.GetFileNameWithoutExtension(path.ToString());
            var extension = Path.GetExtension(path.ToString());
            var directory = Path.GetDirectoryName(path.AbsolutePath);

            while (exists)
            {
                try
                {
                    var request = CreateRequest(path);
                    request.Method = WebRequestMethods.Ftp.GetDateTimestamp;
                    using (request.GetResponse() as FtpWebResponse)
                    {
                        path = FtpUri.Combine(string.Format("{3}/{0}_{1}{2}", fileNameSansExtension, i, extension, directory));
                        i++;
                    }
                }
                catch
                {
                    exists = false;
                }
            }

            return path;
        }
    }
}