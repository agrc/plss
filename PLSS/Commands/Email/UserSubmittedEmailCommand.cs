using System.Linq;
using System.Net.Mail;
using MarkdownMail;
using MarkdownMail.Commands;

namespace PLSS.Commands.Email
{
    public class UserSubmittedEmailCommand : EmailCommand
    {
        public UserSubmittedEmailCommand(dynamic templateData)
        {
            TemplateData = templateData;
            MessageTemplate = @"### Hello Everyone,

**{{Name}}** has submitted corner information about **{{BlmPointId}}**.  
It was was collected on **{{CollectionDate}}**. Isn't that nice.

The file is located at `{{actualPath}}`.

Sincerly your friend,  

Steve";

            MailMessage.To.Add(string.Join(",", templateData.ToAddresses));
            MailMessage.From = new MailAddress(Enumerable.First(templateData.FromAddresses));

            MailMessage.Subject = "PLSS Corner Management System - Corner Submission Successful";

            Init();
        }

        public override sealed string MessageTemplate { get; protected set; }
        public override sealed dynamic TemplateData { get; protected set; }

        public override string ToString()
        {
            return string.Format("{0}, Template: {1}, MessageTemplate: {2}", "UserAcceptedEmailCommand", TemplateData,
                                 MessageTemplate);
        }

        public class MailTemplate : MailTemplateBase
        {
            public MailTemplate(string[] toAddresses, string[] fromAddresses, string name, string blmpointid,
                string collectiondate, string actualPath, string application = null)
                : base(toAddresses, fromAddresses, name, application)
            {
                Blmpointid = blmpointid;
                CollectionDate = collectiondate;
                ActualPath = actualPath;
            }

            public string Blmpointid { get; set; }
            public string CollectionDate { get; set; }
            public string ActualPath { get; set; }

            public override string ToString()
            {
                return string.Format("{0}, Point: {1}, Date: {2}", "UserSubmittedEmailCommand.Template", Blmpointid,
                                     CollectionDate);
            }
        }
    }
}