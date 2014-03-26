using System;
using System.Configuration;
using System.Data.SqlClient;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using CommandPattern;
using NLog;
using PLSS.Attributes;
using PLSS.Commands;
using PLSS.Commands.Queries;
using PLSS.Models;
using PLSS.Models.Response;

namespace PLSS.Controllers
{
    [RoutePrefix("secure")]
    public class AuthorizeController : ApiController
    {
        private static readonly Logger Log = LogManager.GetCurrentClassLogger();

        [Route("authorize", Name = "auth"), NonChallengeAuthorize, HttpGet]
        public async Task<HttpResponseMessage> Get()
        {
            var connection = new SqlConnection(ConfigurationManager.ConnectionStrings["PLSS"].ConnectionString);
            try
            {
                await connection.OpenAsync();

                var user = CommandExecutor.ExecuteCommand(new GetUserCommand(connection, User.Identity.Name)
                    {
                        DefaultFields = "Token, UserId"
                    });

                if (user == null)
                {
                    return Request.CreateResponse(HttpStatusCode.Forbidden,
                                                  new ResponseContainer(HttpStatusCode.Forbidden, "Login first"));
                }

                var token = CommandExecutor.ExecuteCommand(new UpdateUserTokenCommand(connection, user));

                return Request.CreateResponse(HttpStatusCode.OK, new ResponseContainer<TokenContainer>(token));
            }
            catch (Exception ex)
            {
                Log.LogException(LogLevel.Fatal, "problem authorizing", ex);

                return Request.CreateResponse(HttpStatusCode.InternalServerError,
                                              new ResponseContainer(HttpStatusCode.InternalServerError, ex.Message));
            }
            finally
            {
                connection.Close();
                connection.Dispose();
            }
        }
    }
}