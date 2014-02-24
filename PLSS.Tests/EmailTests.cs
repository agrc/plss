using CommandPattern;
using NUnit.Framework;
using PLSS.Commands.Email;
using PLSS.Models;

namespace PLSS.Tests
{
    /// <summary>
    /// Emails are stored in C:\Projects\TestData\EmailPickup
    /// </summary>
    [TestFixture]
    public class EmailTests
    {
        [Test]
        public void SuccessfulTestLooksNice()
        {
            CommandExecutor.ExecuteCommand(new UserSubmittedEmailCommand(
                                    new UserSubmittedEmailCommand.MailTemplate(new[]{"admin@utah.gov"},
                                                                               new[] { "from@user.com" },
                                                                               "name",
                                                                               "blm point id",
                                                                               "a date",
                                                                               "a path")));
 
        }

        [Test]
        public void UnsuccessfulTestLooksNice()
        {
            CommandExecutor.ExecuteCommand(new UserSubmitionFailedEmailCommand(
                                    new UserSubmitionFailedEmailCommand.MailTemplate(new[] { "admin@utah.gov" },
                                                                               new[] { "from@user.com" },
                                                                               "name",
                                                                               "blm point id",
                                                                               "a date")));

        }
        
        [Test]
        public void WelcomeMessageLooksNice()
        {
            CommandExecutor.ExecuteCommand(new WelcomeNewUserEmailCommand(
                                    new WelcomeNewUserEmailCommand.MailTemplate(new[] { "to@newuser.gov" },
                                                                               new[] { "from@user.com" },
                                                                               "name")));

        }[Test]
        public void NotificationOfRegistrationLooksNice()
        {
            CommandExecutor.ExecuteCommand(new NotificationOfRegistrationEmailCommand(
                                    new NotificationOfRegistrationEmailCommand.MailTemplate(new[] { "admin@utah.gov" },
                                                                               new[] { "noreply@user.com" },
                                                                               new User{ FirstName = "First",
                                                                               LastName = "Last",
                                                                               SurveryorLicenseNumber = "SurveryNumber",
                                                                               UserName = "email@address"})));

        }
    }
}
