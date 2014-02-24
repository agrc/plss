using System.IO;
using System.Net;

namespace PLSS.Services.Ftp
{
    public interface IFtpService
    {
        FtpStatusCode Upload(byte[] buffer, string path, out string actualPath);

        Stream Download(string id, out string fileName);

        FtpStatusCode Delete(string id, string path);
    }
}