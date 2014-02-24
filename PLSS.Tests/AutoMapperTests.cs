using System;
using AutoMapper;
using NUnit.Framework;
using PLSS.Models;
using PLSS.Models.ViewModel;

namespace PLSS.Tests
{
    [TestFixture]
    public class AutoMapperTests
    {
        [SetUp]
        public void Setup()
        {
            AutoMapperConfig.BuildMappings();
        }

        [Test]
        public void UserToProfileUser()
        {
            var map = new User
                {
                    FirstName = "F",
                    LastName = "L",
                    SurveryorLicenseNumber = "SLN",
                    SurveyorSeal = new byte[] {1},
                    UserName = "U"
                };

            var mapped = Mapper.Map<ProfileUserViewModel>(map);

            Assert.That(mapped.First, Is.EqualTo(map.FirstName));
            Assert.That(mapped.Last, Is.EqualTo(map.LastName));
            Assert.That(mapped.Email, Is.EqualTo(map.UserName));
            Assert.That(mapped.License, Is.EqualTo(map.SurveryorLicenseNumber));
            Assert.That(mapped.Base64Seal, Is.EqualTo(Convert.ToBase64String(map.SurveyorSeal)));
        } 
    }
}