namespace PLSS.Extensions
{
    public static class ConversionExtensions
    {
        public static double ConvertMetersToFeet(this double meters)
        {
            return meters * (39.37 / 12);
        }

        public static double FeetToMeters(this double feet)
        {
            return feet / (39.37 / 12);
        }

        public static double InternationalFeetToMeters(this double feet)
        {
            return feet * 0.3048f;
        }       
    }
}