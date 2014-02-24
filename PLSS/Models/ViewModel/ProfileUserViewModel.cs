using System.ComponentModel.DataAnnotations;
using System.Web;
using System.Web.Mvc;

namespace PLSS.Models.ViewModel
{
    public class ProfileUserViewModel
    {
        public string First { get; set; }

        public string Last { get; set; }

        [Required(ErrorMessage = "You must provide an email. It is your username to access the system.")]
        public string Email { get; set; }

        public string License { get; set; }

        public string Base64Seal { get; set; }

        public HttpPostedFileBase File { get; set; }

        public string CurrentPassword { get; set; }

        public string NewPassword { get; set; }

        public string NewPasswordAgain { get; set; }

        public string UpdateString
        {
            get
            {
                var updateString = "update Users set " +
                                   "FirstName = @first, " +
                                   "LastName = @last, " +
                                   "SurveryorLicenseNumber = @license, " +
                                   "UserName = @email ";

                if (!string.IsNullOrEmpty(HashedPassword))
                {
                    updateString += ", Password = @hashedPassword ";
                }

                if (Seal != null && Seal.Length > 0)
                {
                    updateString += ", SurveyorSeal = @seal ";
                }

                updateString += "where userid = @userid";

                return updateString;
            }
        }

        public string HashedPassword { get; set; }

        public byte[] Seal { get; set; }

        public void Validate(ModelStateDictionary modelState)
        {
            HashedPassword = null;

            if (!string.IsNullOrEmpty(CurrentPassword))
            {
                if (NewPassword != NewPasswordAgain)
                {
                    modelState.AddModelError("CurrentPassword",
                                             "Your passwords do not match. Please update them to match.");
                }

                if (string.IsNullOrEmpty(NewPassword))
                {
                    modelState.AddModelError("NewPassword",
                         "If you are trying to change your password, you must fill out the two new passord inputs.");

                }
            }

            if (string.IsNullOrEmpty(Email))
            {
                modelState.AddModelError("Email",
                                         "Your passwords do not match. Please update them to match.");
            }
        }
    }
}