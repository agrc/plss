namespace MarkdownMail
{
    public abstract class MailTemplateBase
    {
        protected MailTemplateBase(string[] toAddresses, string[] fromAddresses, string name, string application)
        {
            ToAddresses = toAddresses;
            FromAddresses = fromAddresses;
            Name = name;
            Application = application;
        }

        public string[] ToAddresses { get; set; }
        public string[] FromAddresses { get; set; }
        public string Application { get; set; }
        public string Name { get; set; }

        public override string ToString()
        {
            return string.Format("ToAddresses: {0}, FromAddresses: {1}, Application: {2}, Name: {3}", string.Join(", ", ToAddresses), string.Join(", ", FromAddresses), Application, Name);
        }
    }
}