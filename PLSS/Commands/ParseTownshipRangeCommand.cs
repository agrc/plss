using System.Text.RegularExpressions;
using CommandPattern;
using PLSS.Models.CommandModel;

namespace PLSS.Commands
{
    public class ParseTownshipRangeCommand : Command<TownshipParts>
    {
        private readonly string _id;

        public ParseTownshipRangeCommand(string id)
        {
            _id = id;
        }

        public override void Execute()
        {
            //26T4NR4WSec36
            var townshipValidator =
                new Regex(@"^(26|30)T(\d{1,2}\.?(\d{1})?)(N|S)R(\d{1,2}\.?(\d{1})?)(W|E)Sec(\d{1,2})",
                          RegexOptions.IgnoreCase);

            var match = townshipValidator.Match(_id);

            if (!match.Success)
            {
                Result = null;
                return;
            }

            Result = new TownshipParts(_id,
                                       match.Groups[1].Value,
                                       match.Groups[2].Value,
                                       match.Groups[4].Value,
                                       match.Groups[5].Value,
                                       match.Groups[7].Value,
                                       match.Groups[8].Value);
        }

        public override string ToString()
        {
            return string.Format("{0}, Id: {1}", "ParseTownshipRangeCommand", _id);
        }
    }
}