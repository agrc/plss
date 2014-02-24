using System.Text.RegularExpressions;
using CommandPattern;
using PLSS.Models.CommandModel;

namespace PLSS.Commands
{
    public class ParseBlmPointIdCommand : Command<BlmPointIdParts>
    {
        private readonly string _id;

        public ParseBlmPointIdCommand(string blmid)
        {
            _id = blmid;
        }

        public override void Execute()
        {
            //UT260160S0120E0_640340
            var pointValidator = new Regex(@"^((?:[A-Z][A-Z]))(26|30)(\d{4})(N|S)(\d{4})(E|W)0_\d{6}");

            var match = pointValidator.Match(_id);

            if (!match.Success)
            {
                return;
            }

            //get TRS from blmpoint if supplied
            Result = new BlmPointIdParts(_id,
                                         match.Groups[2].Value,
                                         match.Groups[3].Value,
                                         match.Groups[4].Value,
                                         match.Groups[5].Value,
                                         match.Groups[6].Value);
        }

        public override string ToString()
        {
            return string.Format("{0}, Id: {1}", "ParseBlmPointIdCommand", _id);
        }
    }
}