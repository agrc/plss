using System.ComponentModel.DataAnnotations;

namespace AgrcPasswordManagement.Models.Account
{
    public class AccountAccessBase
    {
        public string Id { get; set; }

        [EmailAddress]
        public string Email { get; set; }
    }
}
