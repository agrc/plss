using System.Web.Http;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace PLSS
{
    public static class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {
            config.Formatters.JsonFormatter.SerializerSettings.ContractResolver = new CamelCasePropertyNamesContractResolver();
            config.Formatters.JsonFormatter.SerializerSettings.NullValueHandling = NullValueHandling.Ignore;
            config.Formatters.Remove(config.Formatters.XmlFormatter);

            //attribute routign
            config.MapHttpAttributeRoutes();

            // To disable tracing in your application, please comment out or remove the following line of code
            // For more information, refer to: http://www.asp.net/web-api
#if DEBUG
            config.EnableSystemDiagnosticsTracing();
#endif
            config.EnsureInitialized();
        }
    }
}
