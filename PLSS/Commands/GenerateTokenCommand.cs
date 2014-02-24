using System;
using System.Globalization;
using CommandPattern;
using PLSS.Models;

namespace PLSS.Commands
{
    public class GenerateTokenCommand : Command<TokenContainer>
    {
        private TokenContainer _token;

        public override void Execute()
        {
            var rand = new Random(DateTime.Now.Millisecond);
            var guid = Guid.NewGuid().ToString();
            var alpha = guid.Substring(0, guid.IndexOf("-", StringComparison.Ordinal)).ToUpper();

            _token = new TokenContainer(string.Format("PLSS-{0}{1}", alpha,
                                            rand.Next(100000, 999999).ToString(CultureInfo.InvariantCulture)));

            Result = _token;
        }

        public override string ToString()
        {
            return string.Format("{0}, Token: {1}", "GenerateTokenCommand", _token);
        }
    }
}