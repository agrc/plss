using System;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web.Http;

namespace PLSS.Controllers
{
    public class ConfigController : ApiController
    {
        [Route("config")]
        public HttpResponseMessage Get()
        {
            var response = Request.CreateResponse(HttpStatusCode.OK, new
                {
                    tiesheet = Url.Route("new", new {}),
                    existing = Url.Route("existing", new {}),
                    reset = Url.Route("forgot", new {}),
                    authorize = Url.Route("auth", new {}),
                    register = Url.Route("register", new {}),
                    authenticate = Url.Route("hello", new {}),
                    leave = Url.Route("bye", new {}),
                    settings = Url.Route("settings", new {})

                });

            response.Headers.CacheControl = new CacheControlHeaderValue
                {
                    MaxAge = new TimeSpan(10, 0, 0, 0),
                    Public = true
                };

            return response;
        }
    }
}