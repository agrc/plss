using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Web;

namespace PLSS.Models.ViewModel
{
    /// <summary>
    /// The data sent on new corner submission
    /// </summary>
    public class CornerViewModel
    {
        private string _description;
        private string _notes;

        /// <summary>
        /// Gets or sets the collection date of the corner.
        /// </summary>
        /// <value>
        /// The collection date.
        /// </value>
        [Required(ErrorMessage = "Required")]
        public DateTime CollectionDate { get; set; }

        /// <summary>
        /// Gets or sets the accuracy of the coordinates taken.
        /// </summary>
        /// <value>
        /// The accuracy.
        /// </value>
        [Required(ErrorMessage = "Required")]
        public string Accuracy { get; set; }

        /// <summary>
        /// Gets or sets the description of the monument.
        /// </summary>
        /// <value>
        /// The description.
        /// </value>
        [Required(ErrorMessage = "Required")]
        public string Description
        {
            get {
                if (_description != null && _description.Length > 500)
                {
                    return _description.Substring(0,500);
                }

                return _description;
            }
            set { _description = value; }
        }

        /// <summary>
        /// Gets or sets the notes about the monument.
        /// </summary>
        /// <value>
        /// The notes.
        /// </value>
        [Required(ErrorMessage = "Required")]
        public string Notes
        {
            get
            {
                if (_notes != null && _notes.Length > 500)
                {
                    return _notes.Substring(0, 500);
                }

                return _notes; ;
            }
            set { _notes = value; }
        }

        /// <summary>
        /// Gets or sets the monument status.
        /// </summary>
        /// <value>
        /// The monument status.
        /// </value>
        [Required(ErrorMessage = "Required")]
        public string MonumentStatus { get; set; }

        /// <summary>
        /// Gets or sets the township section range label for the corner.
        /// </summary>
        /// <value>
        /// The township.
        /// </value>
        [Required(ErrorMessage = "Required")]
        public string Township { get; set; }

        /// <summary>
        /// Gets or sets the location of the section corner.
        /// </summary>
        /// <value>
        /// The section corner.
        /// </value>
        [Required(ErrorMessage = "Required")]
        public string SectionCorner { get; set; }

        /// <summary>
        /// Gets or sets the county the corner is in.
        /// </summary>
        /// <value>
        /// The county.
        /// </value>
        [Required(ErrorMessage = "Required")]
        public string County { get; set; }

        /// <summary>
        /// Gets or sets the geographic coordinate system information on the monument.
        /// </summary>
        /// <value>
        /// The gcoordinate projection information.
        /// </value>
        public CoordinateViewModel Coordinate { get; set; }

        /// <summary>
        /// Gets or sets the grid system for the monument.
        /// </summary>
        /// <value>
        /// The grid.
        /// </value>
        public GridViewModel Grid { get; set; }

        /// <summary>
        /// Gets or sets the BLM point identifier that the surveyor is submitting data for.
        /// </summary>
        /// <value>
        /// The BLM point identifier.
        /// </value>
        public string BlmPointId { get; set; }

        /// <summary>
        /// Gets or sets the surveyor submitting the corner status.
        /// </summary>
        /// <value>
        /// The user.
        /// </value>
        public User User { get; set; }

        public string OtherReason { get; set; }

        public bool UseCountyTitle { get; set; }

        public HttpPostedFileBase Sketch { get; set; }

        public HttpPostedFileBase Thumb { get; set; }
        
        public HttpPostedFileBase Thumb2 { get; set; }

        public IEnumerable<HttpPostedFileBase> Files { get; set; }

        public override string ToString()
        {
            return string.Format("CollectionDate: {0}, Accuracy: {1}, Description: {2}, Notes: {3}, MonumentStatus: {4}, Township: {5}, SectionCorner: {6}, County: {7}, Coordinate: {8}, Grid: {9}, BlmPointId: {10}, User: {11}, OtherReason: {12}, UseCountyTitle: {13}", CollectionDate, Accuracy, Description, Notes, MonumentStatus, Township, SectionCorner, County, Coordinate, Grid, BlmPointId, User, OtherReason, UseCountyTitle);
        }
    }
}