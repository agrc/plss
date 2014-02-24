using CommandPattern;
using PLSS.Models.CommandModel;

namespace PLSS.Commands
{
    public class ChooseBestTrsValueCommand : Command<TownshipParts>
    {
        private readonly string _blmid;
        private readonly string _trs;

        public ChooseBestTrsValueCommand(string blmid, string trs)
        {
            _blmid = blmid;
            _trs = trs;
        }

        public override void Execute()
        {
            var blmparts = CommandExecutor.ExecuteCommand(new ParseBlmPointIdCommand(_blmid));
            var trsparts = CommandExecutor.ExecuteCommand(new ParseTownshipRangeCommand(_trs));

            if (blmparts.Meridian != trsparts.Meridian &&
                blmparts.Township != trsparts.Township &&
                blmparts.TownshipDirection != trsparts.TownshipDirection &&
                blmparts.Range != trsparts.Range &&
                blmparts.RangeDirection != trsparts.RangeDirection)
            {
                Result = null;
                return;
            }

            Result = trsparts;
        }

        public override string ToString()
        {
            return string.Format("{0}, Blmid: {1}, Trs: {2}", "ChooseBestTrsValueCommand", _blmid, _trs);
        }
    }
}