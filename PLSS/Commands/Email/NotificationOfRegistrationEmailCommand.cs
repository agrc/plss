using System.Linq;
using System.Net.Mail;
using MarkdownMail;
using MarkdownMail.Commands;
using PLSS.Models;

namespace PLSS.Commands.Email
{
    public class NotificationOfRegistrationEmailCommand : EmailCommand
    {
        public NotificationOfRegistrationEmailCommand(dynamic templateData)
        {
            TemplateData = templateData;
            MessageTemplate = @"### Hello Mr. Cadastre,

_Somebody_ thought that the **PLSS Corner Management** website was really cool and **registered**.

I wonder if that's the _real_ reason, or if there was some **mandate** that made them. Either way, I hope they really like the website and I wanted you to know who registered:

```  
{{user.name}}  
{{user.username}}  
{{user.SurveryorLicenseNumber}}  
```  

Maybe you should **write** them and say hello? They'd probably like that.

Your friend (っ◕‿◕)っ,

Steve";

            MailMessage.To.Add(string.Join(",", templateData.ToAddresses));
            MailMessage.From = new MailAddress(Enumerable.First(templateData.FromAddresses));

            MailMessage.Subject = "PLSS Corner Management System - Thank you for registering";

            Init();
        }

        public override sealed string MessageTemplate { get; protected set; }
        public override sealed dynamic TemplateData { get; protected set; }

        public override string ToString()
        {
            return string.Format("{0}, MessageTemplate: {1}, TemplateData: {2}", "NotificationOfRegistrationEmailCommand",
                                 MessageTemplate, TemplateData);
        }

        public class MailTemplate : MailTemplateBase
        {
            public User User { get; set; }

            public MailTemplate(string[] toAddresses, string[] fromAddresses, User user, string name="", string application = "")
                : base(toAddresses, fromAddresses, name, application)
            {
                User = user;
            }
        }
    }
}