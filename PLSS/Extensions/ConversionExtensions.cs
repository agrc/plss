namespace PLSS.Extensions
{
    public static class ConversionExtensions
    {
        public static double ConvertMetersToFeet(this double meters)
        {
            return meters * 3.280833333f;
        }

        public static double FeetToMeters(this double feet)
        {
            return feet / 3.280833333f;
        }

        public static double InternationalFeetToMeters(this double feet)
        {
            return feet * 0.3048f;
        }       
    }
}