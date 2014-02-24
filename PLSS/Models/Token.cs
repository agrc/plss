namespace PLSS.Models
{
    public class TokenContainer
    {
        public TokenContainer(string token)
        {
            Token = token;
        }

        public string Token { get; set; }

        public override string ToString()
        {
            return string.Format("Token: {0}", Token);
        }
    }
}