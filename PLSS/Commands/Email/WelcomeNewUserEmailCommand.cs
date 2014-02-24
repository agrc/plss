using System.Linq;
using System.Net.Mail;
using MarkdownMail;
using MarkdownMail.Commands;

namespace PLSS.Commands.Email
{
    public class WelcomeNewUserEmailCommand : EmailCommand
    {
        public WelcomeNewUserEmailCommand(dynamic templateData)
        {
            TemplateData = templateData;
            MessageTemplate = @"### Hello {{name}},

Thank you for registering with the **PLSS Corner Management System**! 

You are now able to start **interacting** with this website. To start **submitting** corner information, _log in_ to the system and **zoom** around the map to find your corner.  **Click** on the corner and use the buttons that appear to submit your information. 

If you have any **questions**, please feel free to drop us an email.

Sincerely,  
AGRC Cadastral Group";

            MailMessage.To.Add(string.Join(",", templateData.ToAddresses));
            MailMessage.From = new MailAddress(Enumerable.First(templateData.FromAddresses));

            MailMessage.Subject = "PLSS Corner Management System - Thank you for registering";

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
            public MailTemplate(string[] toAddresses, string[] fromAddresses, string name, string application = "")
                : base(toAddresses, fromAddresses, name, application)
            {
            }
        }
    }
}