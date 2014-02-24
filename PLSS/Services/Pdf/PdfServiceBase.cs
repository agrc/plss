using System.Collections.Generic;
using System.IO;
using O2S.Components.PDF4NET;
using O2S.Components.PDF4NET.PDFFile;

namespace PLSS.Services.Pdf
{
    public abstract class PdfServiceBase
    {
        /// <summary>
        /// Gets a PDF form.
        /// </summary>
        /// <param name="file">The path to the form.</param>
        /// <returns></returns>
        public virtual PDFDocument GetPdfForm(string file)
        {
            var pdfDoc = new PDFDocument(file);
            return pdfDoc;
        }

        /// <summary>
        /// Merges the PDF docs.
        /// </summary>
        /// <param name="filePaths">The file paths.</param>
        /// <returns></returns>
        public virtual PDFDocument MergePdfDocs(IEnumerable<string> filePaths)
        {
            var pdfSources = new List<Stream>();

            foreach (var path in filePaths)
            {
                if (string.IsNullOrEmpty(path) || !File.Exists(path))
                {
                    continue;
                }

                pdfSources.Add(new MemoryStream(GetPdfForm(path).GetPDFAsByteArray()));
            }

            return MergePdfDocs(pdfSources);
        }

        /// <summary>
        /// Merges the PDF docs.
        /// </summary>
        /// <param name="pdfSources">The PDF sources.</param>
        /// <returns></returns>
        public virtual PDFDocument MergePdfDocs(List<Stream> pdfSources)
        {
            switch (pdfSources.Count)
            {
                case 0:
                    return new PDFDocument();
                case 1:
                    return new PDFDocument(pdfSources[0]);
                default:
                    return PDFFile.MergeFiles(pdfSources.ToArray());
            }
        }

        public abstract PDFDocument HydratePdfForm(PDFDocument template, params object[] args);
    }
}