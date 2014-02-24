namespace PLSS.Models
{
    public class AdminEmail
    {
        public string Email { get; set; }

        public static string GetStatement = "SELECT Email " +
                                            "FROM AdminEmails " +
                                            "WHERE Receive = 1";
    }
}