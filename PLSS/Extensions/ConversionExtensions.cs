namespace PLSS.Extensions
{
    public static class ConversionExtensions
    {
        public static float ConvertMetersToFeet(this float meters)
        {
            return meters * 3.280833333f;
        }

        public static float FeetToMeters(this float feet)
        {
            return feet / 3.280833333f;
        }

        public static float InternationalFeetToMeters(this float feet)
        {
            return feet * 0.3048f;
        }       
    }
}