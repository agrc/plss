using System;
using PLSS.Models.ViewModel;

namespace PLSS.Models
{
    public class Grid
    {
        public Grid()
        {
            
        }

        public Grid(GridViewModel view)
        {
            GridId = Guid.NewGuid();

            Zone = view.Zone;
            Northing = view.Northing;
            Easting = view.Easting;
            Elevation = view.Elevation;
            Adjustment = view.Adjustment;
            Datum = view.Datum;
        }

        public Guid GridId { get; private set; }
        public string Zone { get; private set; }
        public double Northing { get; private set; }
        public double Easting { get; private set; }
        public double Elevation { get; private set; }
        public string Adjustment { get; private set; }
        public string Datum { get; private set; }

        public static string InsertString
        {
            get
            {
                return "insert into Grids(GridId, Zone, Northing, Easting, " +
                       "Elevation, Adjustment, Datum) " +
                       
                       "values (@gridid, @zone, @northing, @easting, @elevation, " +
                       "@adjustment, @datum)";
            }
        }
    }
}