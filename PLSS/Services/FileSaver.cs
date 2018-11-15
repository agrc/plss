using System;
using System.IO;
using NLog;

namespace PLSS.Services
{
    public static class FileSaver
    {
        private static readonly Logger Log = LogManager.GetCurrentClassLogger();

        public static bool SaveFile(string path, byte[] bytes)
        {
            var ok = true;

            try
            {
                var file = new FileInfo(path);

                file.Directory?.Create();
                File.WriteAllBytes(path, bytes);
            }
            catch (Exception ex)
            {
                ok = false;
                Log.FatalException("error saving file", ex);
            }

            return ok;
        }
    }
}
