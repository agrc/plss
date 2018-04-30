using System.Xml.Schema;
using NUnit.Framework;
using PLSS.Extensions;

namespace PLSS.Tests
{
    [TestFixture]
    public class ConversionTests
    {
        [TestCase(10435569.502, 1646720.855)]
        public void Issue21Precision(double northing, double easting)
        {
            Assert.That(northing.FeetToMeters(), Is.EqualTo(3180767.946));
            Assert.That(easting.FeetToMeters(), Is.EqualTo(501921.520));
        }
    }
}