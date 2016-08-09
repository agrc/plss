using System.Web.Mvc;
using PLSS.Models.ViewModel;

namespace PLSS.Controllers
{
    public class HomeController : Controller
    {
        [Route("")]
        public ActionResult Index()
        {
#if DEBUG
            return View(new AssetsViewModel(
                new[]
                {
                    string.Format("<script src='{0}'></script>",
                        Url.Content("~/src/secrets.js")),
                    string.Format(
                        "<script data-dojo-config=\"isDebug: 1, tlmSiblingOfDojo: 1, deps:['app/run']\" src='{0}'></script>",
                        Url.Content("~/src/dojo/dojo.js"))
                },
                new[]
                {
                    string.Format("<link rel='stylesheet' href='{0}'>",
                        Url.Content("~/src/app/resources/App.css"))
                }
                ));
#endif
#if !DEBUG
            return View(new AssetsViewModel(new[]{
                string.Format("<script data-dojo-config='async: 1, deps: [\"app/run\"]' src='{0}'></script>", Url.Content("~/dist/dojo/plss.js"))
            },
            new[]{
                    string.Format("<link rel='stylesheet' href='{0}'>", Url.Content("~/dist/app/resources/App.css"))
                }));
#endif
        }
    }
}