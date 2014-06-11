using PLSS.Extensions;

namespace PLSS.Models.ViewModel
{
    public class CoordinateViewModel
    {
        private double _elipsoidHeight;
        
        public string Northing { get; set; }
        public double NorthingDegrees { get; set; }
        public double NorthingMinutes { get; set; }
        public double NorthingSeconds { get; set; }
        public string Easting { get; set; }
        public double EastingDegrees { get; set; }
        public double EastingMinutes { get; set; }
        public double EastingSeconds { get; set; }
        public double ElipsoidHeight
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

        private double HandleUnit(double value)
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