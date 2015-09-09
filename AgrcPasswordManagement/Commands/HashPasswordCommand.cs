using System.IO;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using AgrcPasswordManagement.Models.Password;
using CommandPattern;

namespace AgrcPasswordManagement.Commands
{
    public class HashPasswordCommand : Command<Task<PasswordHashAndSalt>>
    {
        public HashPasswordCommand(string passwordToHash, string pepper)
        {
            Pepper = pepper;
            var salt = CommandExecutor.ExecuteCommand(new GenerateSaltCommand());

            PasswordToHash = passwordToHash + salt;
            PasswordInfo = new PasswordHashAndSalt(PasswordToHash, salt);
        }

        public HashPasswordCommand(string passwordToHash, string salt, string pepper)
        {
            Pepper = pepper;
            PasswordToHash = passwordToHash + salt;
            PasswordInfo = new PasswordHashAndSalt(PasswordToHash, salt);
        }

        public string PasswordToHash { get; set; }
        public string Pepper { get; set; }
        public PasswordHashAndSalt PasswordInfo { get; set; }

        public override void Execute()
        {
            Result = Task<PasswordHashAndSalt>.Factory.StartNew(() =>
            {
                var enc = new UTF8Encoding();
                var keyGen = new Rfc2898DeriveBytes(PasswordToHash, enc.GetBytes(Pepper));
                var key = keyGen.GetBytes(32);
                var iv = keyGen.GetBytes(16);

                var cipher = new RijndaelManaged
                {
                    Key = key,
                    IV = iv
                };

                var plainText = enc.GetBytes(PasswordToHash);
                using (var encryptor = cipher.CreateEncryptor())
                {
                    using (var ms = new MemoryStream())
                    {
                        using (var cs = new CryptoStream(ms, encryptor, CryptoStreamMode.Write))
                        {
                            cs.Write(plainText, 0, plainText.Length);
                            cs.FlushFinalBlock();

                            PasswordInfo.HashedPassword = enc.GetString(ms.ToArray());

                            return PasswordInfo;
                        }
                    }
                }
            });
        }

        public override string ToString()
        {
            return string.Format("{0}, PasswordToHash: {1}", "HashPasswordCommand", PasswordToHash);
        }
    }
}