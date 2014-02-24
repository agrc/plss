using System;
using CommandPattern;
using PLSS.Commands;
using PLSS.Models.CommandModel;
using PLSS.Models.ViewModel;

namespace PLSS.Models
{
    public class Corner
    {
        private readonly CornerViewModel _corner;
        private readonly TownshipParts _trsparts;

        public Corner(CornerViewModel corner)
        {
            _corner = corner;
            _trsparts = CommandExecutor.ExecuteCommand(
                new ChooseBestTrsValueCommand(_corner.BlmPointId, _corner.Township));

            Township = string.Format("T{0}{1} R{2}{3} Sec{4}", _trsparts.Township, _trsparts.TownshipDirection,
                                     _trsparts.Range, _trsparts.RangeDirection, _trsparts.Section);
        }

        /// <summary>
        ///     Gets the corner identifier. The primary key.
        /// </summary>
        /// <value>
        ///     The corner identifier.
        /// </value>
        public Guid CornerId
        {
            get { return Guid.NewGuid(); }
        }

        /// <summary>
        ///     Gets the user identifier. The foreign key.
        /// </summary>
        /// <value>
        ///     The user identifier.
        /// </value>
        public Guid UserId
        {
            get { return _corner.User.UserId; }
        }

        /// <summary>
        ///     Gets or sets the form information identifier. Foreign Key.
        /// </summary>
        /// <value>
        ///     The form information identifier.
        /// </value>
        public Guid FormInfoId { get; set; }

        /// <summary>
        ///     Gets or sets the photos_ photo identifier. Foreign Key.
        /// </summary>
        /// <value>
        ///     The photos_ photo identifier.
        /// </value>
        public Guid PhotoId { get; set; }

        /// <summary>
        ///     Gets or sets the grid_ grid identifier. Foreign Key
        /// </summary>
        /// <value>
        ///     The grid_ grid identifier.
        /// </value>
        public Guid GridId { get; set; }

        /// <summary>
        ///     Gets or sets the coordinate_ coordinate identifier. Foreign Key
        /// </summary>
        /// <value>
        ///     The coordinate_ coordinate identifier.
        /// </value>
        public Guid CoordinateId { get; set; }

        public string BlmPointId
        {
            get { return _corner.BlmPointId; }
        }

        public DateTime CollectionDate
        {
            get { return _corner.CollectionDate; }
        }

        public string Accuracy
        {
            get { return _corner.Accuracy; }
        }

        /// <summary>
        ///     Gets the township from the township drop down or the blm point id.
        /// </summary>
        /// <value>
        ///     The township.
        /// </value>
        public string Township { get; private set; }

        public string SectionCorner
        {
            get { return _corner.SectionCorner; }
        }

        public string County
        {
            get { return _corner.County; }
        }

        public string BaseMeridian
        {
            get { return _trsparts.Meridian; }
        }

        public string MonumentStatus
        {
            get { return _corner.MonumentStatus; }
        }

        public string Description
        {
            get
            {
                if (_corner.Description.Length > 500)
                {
                    return _corner.Description.Substring(0, 500);
                }

                return _corner.Description;
            }
        }

        public string Notes
        {
            get
            {
                if (_corner.Notes.Length > 500)
                {
                    return _corner.Notes.Substring(0, 500);
                }

                return _corner.Notes;
            }
        }

        public static string InsertString
        {
            get
            {
                return
                    "insert into Corners(CornerId, UserId, FormInfoId, BlmPointId, CollectionDate, " +
                    "Accuracy, Township, SectionCorner, County, BaseMeridian, MonumentStatus, " +
                    "Description, Notes, Photos_PhotoId, Grid_GridId, Coordinate_CoordinateId) " +

                    "values (@cornerid, @userid, @forminfoid, @blmpointid, @collectiondate, " +
                    "@accuracy, @township, @sectioncorner, @county, @basemeridian, @monumentstatus, " +
                    "@description, @notes, @photoid, @gridid, @coordinateid)";
            }
        }
    }
}