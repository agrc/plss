using System;

namespace PLSS.Models
{
    public class FormInfo
    {
        public FormInfo(string surveyorName, string cornerId)
        {
            FormInfoId = Guid.NewGuid();
            Path = System.IO.Path.Combine("UserCommittedTieSheets", surveyorName,
                                DateTime.Now.ToShortDateString().Replace("/", "-"),
                                cornerId) + ".pdf";
        }
        /// <summary>
        /// Gets the form information identifier. Primary Key
        /// </summary>
        /// <value>
        /// The form information identifier.
        /// </value>
        public Guid FormInfoId { get; private set; }

        /// <summary>
        /// Gets the path to the uploaded pdf.
        /// </summary>
        /// <value>
        /// The path.
        /// </value>
        public string Path { get; private set; }

        /// <summary>
        /// Gets or sets a value indicating whether the pdf in the path was uploaded successfully.
        /// </summary>
        /// <value>
        ///   <c>true</c> if [uploaded successfully]; otherwise, <c>false</c>.
        /// </value>
        public bool UploadedSuccessfully { get; set; }

        public static string InsertString
        {
            get
            {
                return "insert into FormInfoes(FormInfoId, Path, UploadedSuccessfully) " +
                "values(@forminfoid, @path, @uploadedsuccessfully)";
            }
        }
    }
}