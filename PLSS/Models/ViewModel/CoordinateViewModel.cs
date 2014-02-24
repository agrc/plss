using PLSS.Extensions;

namespace PLSS.Models.ViewModel
{
    public class CoordinateViewModel
    {
        private float _elipsoidHeight;
        
        public string Northing { get; set; }
        public float NorthingDegrees { get; set; }
        public float NorthingMinutes { get; set; }
        public float NorthingSeconds { get; set; }
        public string Easting { get; set; }
        public float EastingDegrees { get; set; }
        public float EastingMinutes { get; set; }
        public float EastingSeconds { get; set; }
        public float ElipsoidHeight
        {
            get { return HandleUnit(_elipsoidHeight); }
            set { _elipsoidHeight = value; }
        }
        public string VerticalUnits { get; set; }
        public string Adjustment { get; set; }
        public string Datum
        {
            get
            {
                switch (CoordinateSystem)
                {
                    case "NAD83 Geographic":
                        {
                            return "NAD83";
                        }
                    case "NAD27 Geographic":
                        {
                            return "NAD27";
                        }
                    case "WGS84 Geographic":
                        {
                            return "WGS84";
                        }
                }

                return "";
            }
        }

        /// <summary>
        /// Gets or sets the geographic coordinate system.
        /// </summary>
        /// <value>
        /// The geographic coordinate system.
        /// </value>
        public string CoordinateSystem { get; set; }

        private float HandleUnit(float value)
        {
            if (VerticalUnits == "US Survey Feet")
            {
                return value.FeetToMeters();
            }

            if (VerticalUnits == "International Feet")
            {
                return value.InternationalFeetToMeters();
            }

            //its already meters
            return value;
        }
    }
}