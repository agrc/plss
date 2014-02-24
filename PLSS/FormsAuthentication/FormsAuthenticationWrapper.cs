namespace PLSS.FormsAuthentication
{
    public class FormsAuthenticationWrapper : IFormsAuthentication
    {
        public void SetAuthCookie(string userName, bool createPersistentCookie)
        {
            System.Web.Security.FormsAuthentication.SetAuthCookie(userName, createPersistentCookie);
        }

        public void SignOut()
        {
            System.Web.Security.FormsAuthentication.SignOut();
        }

        public string HashPasswordForStoringInConfigFile(string password)
        {
#pragma warning disable 612,618
            return System.Web.Security.FormsAuthentication.HashPasswordForStoringInConfigFile(password, "SHA1");
#pragma warning restore 612,618
        }
    }
}