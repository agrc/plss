using System.Linq;
using System.Net.Mail;
using MarkdownMail;
using MarkdownMail.Commands;

namespace PLSS.Commands.Email
{
    public class UserSubmitionFailedEmailCommand : EmailCommand
    {
        public UserSubmitionFailedEmailCommand(dynamic templateData)
        {
            TemplateData = templateData;
            MessageTemplate = @"### Hello Everyone,

**{{Name}}** has submitted corner information about **{{BlmPointId}}**.  
It was collected on **{{CollectionDate}}**. 

_Unfortunately_, the pdf was **not** saved properly. We will need to **rebuild** it from the database.

_Fortunately_, I think I still remember how to do that. So just come and ask me.

Sincerly your friend,  

Steve";

            MailMessage.To.Add(string.Join(",", templateData.ToAddresses));
            MailMessage.From = new MailAddress(Enumerable.First(templateData.FromAddresses));

            MailMessage.Subject = "PLSS Corner Management System - Corner Submission Failed";

            Init();
        }

        public override sealed string MessageTemplate { get; protected set; }
        public override sealed dynamic TemplateData { get; protected set; }

        public override string ToString()
        {
            return string.Format("{0}, MessageTemplate: {1}, TemplateData: {2}", "UserSubmitionFailedEmailCommand",
                                 MessageTemplate, TemplateData);
        }

        public class MailTemplate : MailTemplateBase
        {
            public MailTemplate(string[] toAddresses, string[] fromAddresses, string name, string blmpointid,
                                string collectiondate, string application = null)
                : base(toAddresses, fromAddresses, name, application)
            {
                Blmpointid = blmpointid;
                CollectionDate = collectiondate;
            }

            public string Blmpointid { get; set; }
            public string CollectionDate { get; set; }
        }
    }
}