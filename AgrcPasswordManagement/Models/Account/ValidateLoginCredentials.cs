namespace AgrcPasswordManagement.Models.Account
{
    /// <summary>
    ///     A transfer object for validing a user
    /// </summary>
    public class ValidateLoginCredentials
    {
        public ValidateLoginCredentials(string password, string salt, string pepper, string id)
        {
            Password = password;
            Salt = salt;
            Pepper = pepper;
            Id = id;
        }

        public string Password { get; set; }
        public string Salt { get; set; }
        public string Pepper { get; set; }
        public string Id { get; set; }
    }
}