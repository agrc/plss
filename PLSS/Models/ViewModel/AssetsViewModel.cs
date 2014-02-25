namespace PLSS.Models.ViewModel
{
    public class AssetsViewModel
    {
        public AssetsViewModel(string[] scripts, string[] css)
        {
            Scripts = scripts;
            Css = css;
        }

        public string[] Scripts { get; set; }
        public string[] Css { get; set; }
    }
}