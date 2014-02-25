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
            return View(new AssetsViewModel(new[]{
                "<script data-dojo-config=\"isDebug: 1, tlmSiblingOfDojo: 1, deps:['app/runApp']\" src='plss/src/dojo/dojo.js'></script>"
//                ,"<script src='plss/src/app/runApp.js'></script>"
            },
            new[]{
                    "<link rel='stylesheet' href='plss/src/app/resources/App.css'>"
                }));
#endif
#if !DEBUG
            return View(new AssetsViewModel(new[]{
                "<script data-dojo-config='async: 1, deps: [\"app/runApp\"]' src='plss/dist/app/App.js'></script>"
            },
            new[]{
                    "<link rel='stylesheet' href='plss/dist/app/resources/App.css'>"
                }));
#endif
        }
    }
}