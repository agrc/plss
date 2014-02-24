using System.IO;
using System.Linq;
using System.Net.Mail;
using System.Net.Mime;
using System.Threading;
using MarkdownMail;
using MarkdownMail.Commands;

namespace PLSS.Commands.Email
{
    public class NotifyCountyEmailCommand : EmailCommand
    {
        public NotifyCountyEmailCommand(dynamic templateData)
        {
            TemplateData = templateData;
            MessageTemplate = @"### Hello {{FullName}},

A monument record sheet in **{{County}}** county has been submitted to the 
**PLSS Corner Management Portal** by **{{SurveyorName}}**.  

Please _review_ the attached file and **reply all** to this email with your 
_approval_ or with your reasons for _not approving_ the sheet. If we do **not** 
hear from you within **10** days, we will consider the sheet **approved** 
and make it availabe on the web site.

Thank you,

AGRC";
            var stream = new MemoryStream(templateData.PdfBytes);
            MailMessage.Attachments.Add(new Attachment(stream, templateData.PdfName, MediaTypeNames.Application.Pdf));

            MailMessage.To.Add(string.Join(",", templateData.ToAddresses));
            MailMessage.From = new MailAddress(Enumerable.First(templateData.FromAddresses));

            MailMessage.Subject = "PLSS Corner Management System - New monument record sheet added in your county";

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
            public MailTemplate(string[] toAddresses, string[] fromAddresses, string fullname,
                                string surveyorName, string blmpointid,
                                string county, byte[] pdfBytes, string pdfName, string application = null)
                : base(toAddresses, fromAddresses, surveyorName, application)
            {
                Fullname = fullname;
                SurveyorName = surveyorName;
                Blmpointid = blmpointid;
                County =  Thread.CurrentThread.CurrentCulture.TextInfo.ToTitleCase(county.ToLower());
                PdfBytes = pdfBytes;
                PdfName = pdfName;
            }

            public string Fullname { get; set; }
            public string SurveyorName { get; set; }
            public string Blmpointid { get; set; }
            public string County { get; set; }
            public byte[] PdfBytes { get; set; }
            public string PdfName { get; set; }
        }
    }
}