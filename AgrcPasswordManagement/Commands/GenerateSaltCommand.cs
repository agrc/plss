using System;
using System.Security.Cryptography;
using CommandPattern;

namespace AgrcPasswordManagement.Commands
{
    public class GenerateSaltCommand : Command<string>
    {
        public override void Execute()
        {
            using (var randomNumberGenerator = new RNGCryptoServiceProvider())
            {
                var bytes = new byte[25];

                randomNumberGenerator.GetBytes(bytes);

                Result = Convert.ToBase64String(bytes);
            }
        }

        public override string ToString()
        {
            return string.Format("GenerateSaltCommand");
        }
    }
}