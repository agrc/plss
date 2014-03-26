using System.Web.Mvc;

namespace PLSS.Attributes
{
    public class NonChallengeAuthorizeAttribute : AuthorizeAttribute
    {
        protected override void HandleUnauthorizedRequest(AuthorizationContext filterContext)
        {
           filterContext.RequestContext.HttpContext.Response.StatusCode = 403;
           filterContext.RequestContext.HttpContext.Response.Status = "Forbidden";
           filterContext.RequestContext.HttpContext.Response.StatusDescription = "Forbidden";
           filterContext.RequestContext.HttpContext.Response.End();
           filterContext.RequestContext.HttpContext.Response.Close();
        }
    }
}