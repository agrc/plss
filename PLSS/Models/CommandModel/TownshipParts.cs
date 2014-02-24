namespace PLSS.Models.CommandModel
{
    public class TownshipParts
    {
        public TownshipParts(string all, string meridian, string township, string townshipDirection, string range, string rangeDirection, string section)
        {
            All = all;
            Meridian = meridian.Trim();
            Township = township.Trim();
            TownshipDirection = townshipDirection.Trim();
            Range = range.Trim();
            RangeDirection = rangeDirection.Trim();
            Section = section.Trim();
        }

        private string _meridian;
        public string All { get; set; }

        public string Meridian
        {
            get { return _meridian == "26" ? "Salt Lake" : "Uinta"; }
            set { _meridian = value; }
        }

        public string Township { get; set; }
        public string TownshipDirection { get; set; }
        public string Range { get; set; }
        public string RangeDirection { get; set; }
        public string Section { get; set; }
    }
}