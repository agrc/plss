using System.Web.Mvc;

namespace PLSS.Controllers
{
    public class HomeController : Controller
    {
        [Route("")]
        public ActionResult Index()
        {
            return View();
        }
    }
}