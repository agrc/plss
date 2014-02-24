using System.Linq;
using System.Net.Mail;
using MarkdownMail;
using MarkdownMail.Commands;

namespace PLSS.Commands.Email
{
    public class ResetPasswordEmailCommand : EmailCommand
    {
        public ResetPasswordEmailCommand(dynamic templateData)
        {
            TemplateData = templateData;
            MessageTemplate = @"### Hello {{name}},

There was a request to **reset** your password within the **PLSS Corner Management System**

Your **new** password is `{{password}}`

THis password is intended to be **temporary**.  
To change your password to something you _will_ remember, **Log in** and navigate to the `Settings` link.

If you have any **questions**, please feel free to drop us an email.

Sincerely,  
AGRC Cadastral Group";

            MailMessage.To.Add(string.Join(",", templateData.ToAddresses));
            MailMessage.From = new MailAddress(Enumerable.First(templateData.FromAddresses));

            MailMessage.Subject = "PLSS Corner Management System - Password Reset";

            Init();
        }

        public override sealed string MessageTemplate { get; protected set; }
        public override sealed dynamic TemplateData { get; protected set; }

        public override string ToString()
        {
            return string.Format("{0}, MessageTemplate: {1}, TemplateData: {2}", "WelcomeNewUserEmailCommand",
                                 MessageTemplate, TemplateData);
        }

        public class MailTemplate : MailTemplateBase
        {
            public string Password { get; set; }

            public MailTemplate(string[] toAddresses, string[] fromAddresses, string name, string password, string application = "")
                : base(toAddresses, fromAddresses, name, application)
            {
                Password = password;
            }
        } 
    }
}