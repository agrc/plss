using O2S.Components.PDF4NET;
using O2S.Components.PDF4NET.Forms;

namespace PLSS.Services.Pdf
{
    public static class PdfExtensions
    {
        /// <summary>
        /// Tries to write to PDF text field.
        /// </summary>
        /// <param name="doc">The document.</param>
        /// <param name="field">The field.</param>
        /// <param name="value">The value.</param>
        public static void WriteToPdfTextField(this PDFDocument doc, string field, string value)
        {
            var pdfTextBoxField = doc.Fields[field] as PDFTextBoxField;
            if (pdfTextBoxField == null) return;

            pdfTextBoxField.Text = value;
        }

        /// <summary>
        /// Tries to write to PDF text field.
        /// </summary>
        /// <param name="page">The document.</param>
        /// <param name="field">The field.</param>
        /// <param name="value">The value.</param>
        public static void WriteToPdfTextField(this PDFPage page, string field, string value)
        {
            var pdfTextBoxField = page.Fields[field] as PDFTextBoxField;
            if (pdfTextBoxField == null) return;

            pdfTextBoxField.Text = value;
        } 
    }
}