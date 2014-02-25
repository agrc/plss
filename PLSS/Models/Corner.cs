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
        private Guid _userId;
        private string _blmPointId;
        private DateTime _date;
        private string _accuracy;
        private string _section;
        private string _county;
        private string _meridian;
        private string _status;
        private string _description;
        private string _notes;

        public Corner()
        {
        }

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
            set { _userId = value; }
            get
            {
                return _corner == null ? _userId : _corner.User.UserId;
            }
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
            get { return _corner == null ? _blmPointId : _corner.BlmPointId; }
            set { _blmPointId = value; }
        }

        public DateTime CollectionDate
        {
            get { return _corner == null ? _date : _corner.CollectionDate; }
            set { _date = value; }
        }

        public string Accuracy
        {
            get { return _corner == null ? _accuracy : _corner.Accuracy; }
            set { _accuracy = value; }
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
            get { return _corner == null ? _section : _corner.SectionCorner; }
            set { _section = value; }
        }

        public string County
        {
            get { return _corner == null ? _county : _corner.County; }
            set { _county = value; }
        }

        public string BaseMeridian
        {
            get { return _corner == null ? _meridian : _trsparts.Meridian; }
            set { _meridian = value; }
        }

        public string MonumentStatus
        {
            get { return _corner == null ? _status : _corner.MonumentStatus; }
            set { _status = value; }
        }

        public string Description
        {
            get
            {
                if (_corner == null)
                {
                    return _description;
                }

                if (_corner.Description.Length > 500)
                {
                    return _corner.Description.Substring(0, 500);
                }

                return _corner.Description;
            }
            set { _description = value; }
        }

        public string Notes
        {
            get
            {
                if (_corner == null)
                {
                    return _notes;
                }

                if (_corner.Notes.Length > 500)
                {
                    return _corner.Notes.Substring(0, 500);
                }

                return _corner.Notes;
            }
            set { _notes = value; }
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