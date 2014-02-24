using PLSS.Extensions;

namespace PLSS.Models.ViewModel
{
    public class GridViewModel
    {
        private float _northing;
        private float _easting;
        private float _elevation;

        public string Zone { get; set; }

        public float Northing
        {
            get { return HandleUnit(_northing); }
            set { _northing = value; }
        }

        public float Easting
        {
            get { return HandleUnit(_easting); }
            set { _easting = value; }
        }

        public float Elevation
        {
            get { return HandleUnit(_elevation); } 
            set { _elevation = value; }
        }

        public string Adjustment { get; set; }
       
        public string HorizontalUnits { get; set; }

        /// <summary>
        ///     Gets or sets the grid coordinate system.
        /// </summary>
        /// <value>
        ///     The grid coordinate system.
        /// </value>
        public string CoordinateSystem { get; set; }

        public string Datum
        {
            get
            {
                switch (CoordinateSystem)
                {
                    case "NAD83 State Plane":
                    case "NAD83 UTM Zone 11N":
                    case "NAD83 UTM Zone 12N":
                        {
                            return "NAD83";
                        }
                    case "NAD27 State Plane":
                        {
                            return "NAD27";
                        }
                }

                return "";
            }
        }

        private float HandleUnit(float value)
        {
            if (HorizontalUnits == "US Survey Feet")
            {
                return value.FeetToMeters();
            }

            if (HorizontalUnits == "International Feet")
            {
                return value.InternationalFeetToMeters();
            }

            //its already meters
            return value;
        }
    }
}