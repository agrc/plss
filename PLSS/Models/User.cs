using System;
using System.Collections.Generic;
using CommandPattern;
using PLSS.Commands;
using PLSS.Models.ViewModel;

namespace PLSS.Models
{
    public class User
    {
        public User()
        {
            
        }

        public User(RegistrationViewModel registrant)
        {
            UserId = Guid.NewGuid();
            FirstName = registrant.FirstName;
            LastName = registrant.LastName;
            SurveryorLicenseNumber = registrant.License;
            UserName = registrant.Email;
            Password = registrant.Password;
            Token = CommandExecutor.ExecuteCommand(new GenerateTokenCommand()).Token;
        }

        public Guid UserId { get; set; }

        /// <summary>
        ///     Gets or sets the first name.
        /// </summary>
        /// <value>
        ///     The first name.
        /// </value>
        public string FirstName { get; set; }

        /// <summary>
        ///     Gets or sets the last name.
        /// </summary>
        /// <value>
        ///     The last name.
        /// </value>
        public string LastName { get; set; }

        public string Name
        {
            get
            {
                return string.Format("{0} {1}", FirstName, LastName);
            }
        }

        /// <summary>
        ///     Gets or sets the surveryor license number.
        /// </summary>
        /// <value>
        ///     The surveryor license number.
        /// </value>
        public string SurveryorLicenseNumber { get; set; }

        /// <summary>
        ///     Gets or sets the surveyor seal image
        /// </summary>
        /// <value>
        ///     The surveyor seal.
        /// </value>
        public byte[] SurveyorSeal { get; set; }

        /// <summary>
        ///     Gets or sets the name of the user.
        /// </summary>
        /// <value>
        ///     The name of the user.
        /// </value>
        public string UserName { get; set; }

        /// <summary>
        ///     Gets or sets the password.
        /// </summary>
        /// <value>
        ///     The password.
        /// </value>
        public string Password { get; set; }

        /// <summary>
        ///     Gets or sets the token.
        /// </summary>
        /// <value>
        ///     The user token.
        /// </value>
        public string Token { get; set; }

        public IEnumerable<KeyValuePair<string,string>> ValidateLoginInput()
        {
            var responseContent = new List<KeyValuePair<string,string>>();
            if (string.IsNullOrEmpty(UserName))
            {
                responseContent.Add(new KeyValuePair<string, string>("login.email", "Username is required and empty."));
            }

            if (string.IsNullOrEmpty(Password))
            {
                responseContent.Add(new KeyValuePair<string, string>("login.password","Password is required and empty."));
            }

            return responseContent;
        }

        public static string InsertString
        {
            get
            {
                return "insert into Users(UserId,FirstName,LastName,SurveryorLicenseNumber,UserName,Password) " +
                "values(@userid, @firstname, @lastname, @SurveryorLicenseNumber,@username,@password)";
            }
        }
    }
}