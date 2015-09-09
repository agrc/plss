using System.ComponentModel.DataAnnotations;

namespace AgrcPasswordManagement.Models.Account
{
    public class LoginCredentials : AccountAccessBase
    {
        private string _application;

        public LoginCredentials()
        {
            
        }

        public LoginCredentials(string email, string password, string application, bool persist = false)
        {
            Password = password;
            Application = application;
            Persist = persist;
            Email = email;
        }

        /// <summary>
        /// Gets or sets the password.
        /// </summary>
        /// <value>
        /// The password.
        /// </value>
        [Required]
        public string Password { get; set; }

        /// <summary>
        /// Gets or sets the application.
        /// </summary>
        /// <value>
        /// The application.
        /// </value>
        [Required]
        public string Application
        {
            get
            {
                if (_application == null || string.IsNullOrEmpty(_application))
                    return null;
                
                return _application.ToLower();
            }
            set
            {
                if (value == null || string.IsNullOrEmpty(value))
                    _application = null;
                else
                {
                    _application = value;
                }
            }
        }

        /// <summary>
        /// Gets or sets a value indicating whether to [persist] the auth cookie.
        /// </summary>
        /// <value>
        ///   <c>true</c> if [persist]; otherwise, <c>false</c>.
        /// </value>
        public bool Persist { get; set; }
    }
}