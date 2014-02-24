namespace PLSS.FormsAuthentication
{
    public interface IFormsAuthentication
    {
        void SignOut();

        void SetAuthCookie(string userName, bool createPersistentCookie);

        string HashPasswordForStoringInConfigFile(string password);
    }
}