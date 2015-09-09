using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.SqlClient;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using CommandPattern;
using NLog;
using PLSS.Commands;
using PLSS.Commands.Queries;
using PLSS.FormsAuthentication;
using PLSS.Models;
using PLSS.Models.Response;

namespace PLSS.Controllers
{
    public class AuthenticateController : ApiController
    {
        private static readonly Logger Log = LogManager.GetCurrentClassLogger();

        [Route("authenticate", Name="hello"), HttpPost]
        public async Task<HttpResponseMessage> Post([FromBody] User user)
        {
            var responseContent = user.ValidateLoginInput();
            if (responseContent.Any())
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest, responseContent);
            }

            var connection = new SqlConnection(ConfigurationManager.ConnectionStrings["PLSS"].ConnectionString);
            try
            {
                await connection.OpenAsync();
                var databaseUser = CommandExecutor.ExecuteCommand(new GetUserCommand(connection, user.UserName)
                        {
                            DefaultFields = "UserId,UserName,Password"
                        });

                if (databaseUser == null)
                {
                    return Request.CreateResponse(HttpStatusCode.BadRequest,
                                                  new []{new KeyValuePair<string, string>("login.email", "User does not exist.")});
                }

                var formsAuth = new FormsAuthenticationWrapper();

                if (databaseUser.Password != formsAuth.HashPasswordForStoringInConfigFile(user.Password))
                {
                    return Request.CreateResponse(HttpStatusCode.BadRequest,
                        new[]{new KeyValuePair<string, string>("login.password", "Incorrect password.")});
                }

                formsAuth.SetAuthCookie(databaseUser.UserName, false);

                var token = CommandExecutor.ExecuteCommand(new UpdateUserTokenCommand(connection, databaseUser));

                return Request.CreateResponse(HttpStatusCode.OK, new ResponseContainer<TokenContainer>(token));
            }
            catch (Exception ex)
            {
                Log.LogException(LogLevel.Fatal, "problem signing in", ex);

                return Request.CreateResponse(HttpStatusCode.InternalServerError,
                                                 new ResponseContainer(HttpStatusCode.InternalServerError, ex.Message));
            }
            finally
            {
                connection.Close();
                connection.Dispose();
            }
        }

        [Route("authenticate/logout", Name="bye"), HttpGet]
        public HttpResponseMessage Logout()
        {
            var formsAuth = new FormsAuthenticationWrapper();
            formsAuth.SignOut();

            return Request.CreateResponse(HttpStatusCode.NoContent);
        }
    }
}