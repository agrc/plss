using System;
using System.Configuration;
using System.Data.SqlClient;
using System.Linq;
using System.Web.Http;
using System.Web.Mvc;
using System.Web.Routing;
using Dapper;

using PLSS.Models;

namespace PLSS
{
    // Note: For instructions on enabling IIS6 or IIS7 classic mode, 
    // visit http://go.microsoft.com/?LinkId=9394801

    public class App : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            AreaRegistration.RegisterAllAreas();

            WebApiConfig.Register(GlobalConfiguration.Configuration);
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            CacheConfig.CacheValues();
            AutoMapperConfig.BuildMappings();
        }

        void Application_Error(object sender, EventArgs e)
        {
            // Code that runs when an unhandled error occurs
            var exc = Server.GetLastError();
            try
            {
                if (exc.Message.Contains("Maximum request length exceeded"))
                {
                    //Response.Redirect("~/About.aspx", false);
                    Server.ClearError();
                    Response.Redirect(Request.RawUrl + "&message=filesize", true);
                }
            }
            finally
            {
            }
        }

        public static string[] AdminEmails { get; set; }
    }

    public class CacheConfig
    {
        public static void CacheValues()
        {
            App.AdminEmails = new string[]{};

            var connection = new SqlConnection(ConfigurationManager.ConnectionStrings["PLSS"].ConnectionString);

            try
            {
                connection.Open();

                App.AdminEmails = connection.Query<string>(AdminEmail.GetStatement).ToArray();
            }
            finally
            {
                connection.Close();
                connection.Dispose();
            }
        }
    }
}