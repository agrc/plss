using System;
using PLSS.Models.ViewModel;

namespace PLSS.Models
{
    public class Coordinate
    {
        public Coordinate()
        {
            
        }

        public Coordinate(CoordinateViewModel view)
        {
            CoordinateId = Guid.NewGuid();

            Northing = view.Northing;
            NorthingDegrees = view.NorthingDegrees;
            NorthingMinutes = view.NorthingMinutes;
            NorthingSeconds = view.NorthingSeconds;
            Easting = view.Easting;
            EastingDegrees = view.EastingDegrees;
            EastingMinutes = view.EastingMinutes;
            EastingSeconds = view.EastingSeconds;
            ElipsoidHeight = view.ElipsoidHeight;
            Adjustment = view.Adjustment;
            Datum = view.Datum;
        }

        public Guid CoordinateId { get; private set; }
        public string Northing { get; private set; }
        public double NorthingDegrees { get; private set; }
        public double NorthingMinutes { get; private set; }
        public double NorthingSeconds { get; private set; }
        public string Easting { get; private set; }
        public double EastingDegrees { get; private set; }
        public double EastingMinutes { get; private set; }
        public double EastingSeconds { get; private set; }
        public double ElipsoidHeight { get; private set; }
        public string Adjustment { get; private set; }
        public string Datum { get; private set; }

        public static string InsertString
        {
            get
            {
                return "insert into Coordinates(CoordinateId, Northing, NorthingDegrees, " +
                       "NorthingMinutes, NorthingSeconds, Easting, EastingDegrees, " +
                       "EastingMinutes, EastingSeconds, ElipsoidHeight, Adjustment, Datum)" +

                       "values(@coordinateid, @northing, @northingdegrees, @northingminutes, " +
                       "@northingseconds, @easting, @eastingdegrees, @eastingminutes, @eastingseconds, " +
                       "@elipsoidheight, @adjustment, @datum)";
            }
        }
    }
}