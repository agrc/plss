namespace PLSS.Models.CommandModel
{
    public class BlmPointIdParts : TownshipParts
    {
        public BlmPointIdParts(string all, string meridian, string township, string townshipDirection, string range,
                               string rangeDirection, string section = "")
            : base(all, meridian, township, townshipDirection, range, rangeDirection, section)
        {
        }
    }
}