using System.ComponentModel.DataAnnotations;
using System.Configuration;
using System.Data.SqlClient;
using System.Web.Http.ModelBinding;
using CommandPattern;
using PLSS.Commands.Queries;

namespace PLSS.Models.ViewModel
{
    public class RegistrationViewModel
    {
        [Required(AllowEmptyStrings = false, ErrorMessage = "Please provide your email address."), EmailAddress]
        public string Email { get; set; }

        [Required(AllowEmptyStrings = false, ErrorMessage = "Your password cannot be empty.")]
        public string Password { get; set; }

        [Required(AllowEmptyStrings = false, ErrorMessage = "Your password cannot be empty.")]
        public string PasswordAgain { get; set; }

        [Required(AllowEmptyStrings = false, ErrorMessage = "First Name cannot be empty.")]
        public string FirstName { get; set; }

        [Required(AllowEmptyStrings = false, ErrorMessage = "Last Name cannot be empty.")]
        public string LastName { get; set; }

        public string License { get; set; }

        public void Validate(ModelStateDictionary modelState)
        {
            if (Password != PasswordAgain)
            {
                modelState.AddModelError("registrant.Password", "Your passwords do not match. Please update them to match.");
            }

            if (string.IsNullOrEmpty(Email))
            {
                return;
            }

            using (var connection = new SqlConnection(ConfigurationManager.ConnectionStrings["PLSS"].ConnectionString))
            {
                var user = CommandExecutor.ExecuteCommand(new GetUserCommand(connection, Email){DefaultFields = "username"});

                if (user != null)
                {
                    modelState.AddModelError("registrant.Email", "The email address is already in use. Please choose a unique one or reset your current password.");
                }
            }
        }
    }
}