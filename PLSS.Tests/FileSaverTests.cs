using System;
using System.IO;
using NUnit.Framework;
using PLSS.Services;

namespace PLSS.Tests
{
    [TestFixture]
    public class FileSaverTests
    {
        [Test]
        public void SaveFile()
        {
            var bytes = File.ReadAllBytes("MonumentStatusTemplate.v1.pdf");

            var path = Path.Combine("UserCommittedTieSheets",
                                    "sgourley",
                                    DateTime.Now.ToShortDateString().Replace("/", "-"),
                                    "1010593") + ".pdf";
            var actualPath = Path.Combine("c:\\temp\\", path);

            var success = FileSaver.SaveFile(actualPath, bytes);

            Assert.IsTrue(success);
        }
        
    }
}
