using System;

namespace PLSS.Services.Ftp
{
    public class FtpService : FtpServiceBase
    {
        public FtpService(string username, string password, string ftpUri)
        {
            Password = password;
            FtpUser = username;
            FtpUri = new Uri(ftpUri);
        }
    }
}