using System.Configuration;
using System.Data.SqlClient;
using System.Diagnostics;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using CommandPattern;
using Dapper;
using PLSS.Commands;
using PLSS.Commands.Email;
using PLSS.Commands.Queries;
using PLSS.Extensions;
using PLSS.FormsAuthentication;
using PLSS.Models;
using PLSS.Models.Response;
using PLSS.Models.ViewModel;

namespace PLSS.Controllers
{
    public class UserController : ApiController
    {
        [Route("register", Name="register"), HttpPost]
        public async Task<HttpResponseMessage> Post(RegistrationViewModel registrant)
        {
            registrant.Validate(ModelState);

            if (!ModelState.IsValid)
            {
                var errors = ModelState.ToErrors();

                return Request.CreateResponse(HttpStatusCode.BadRequest, errors);
            }

            var formsAuth = new FormsAuthenticationWrapper();
            registrant.Password = formsAuth.HashPasswordForStoringInConfigFile(registrant.Password);

            var user = new User(registrant);

            using (var connection = new SqlConnection(ConfigurationManager.ConnectionStrings["plss"].ConnectionString))
            {
                await connection.OpenAsync();
                var uInserts = connection.Execute(Models.User.InsertString, user);
                Debug.Assert(uInserts == 1, "inserted into users successfully");

                formsAuth.SetAuthCookie(user.UserName, false);
            }

            CommandExecutor.ExecuteCommand(
                new WelcomeNewUserEmailCommand(
                    new WelcomeNewUserEmailCommand.MailTemplate(new[] {user.UserName}, App.AdminEmails, user.Name)));

            CommandExecutor.ExecuteCommand(
                new NotificationOfRegistrationEmailCommand(
                    new NotificationOfRegistrationEmailCommand.MailTemplate(App.AdminEmails, new[] {"no-reply@utah.gov"},
                                                                            user)));

            return Request.CreateResponse(HttpStatusCode.OK,
                                          new ResponseContainer<TokenContainer>(new TokenContainer(user.Token)));
        }

        [Route("reset", Name="forgot"), HttpPost]
        public async Task<HttpResponseMessage> Reset(ResetPasswordViewModel model)
        {
            if (string.IsNullOrEmpty(model.UserName))
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest);
            }

            using (var connection = new SqlConnection(ConfigurationManager.ConnectionStrings["plss"].ConnectionString))
            {
                await connection.OpenAsync();

                var user = CommandExecutor.ExecuteCommand(new GetUserCommand(connection, model.UserName));

                if (user == null)
                {
                    return Request.CreateResponse(HttpStatusCode.BadRequest);
                }

                var formsAuth = new FormsAuthenticationWrapper();
                var token = CommandExecutor.ExecuteCommand(new GenerateTokenCommand());
                user.Password = formsAuth.HashPasswordForStoringInConfigFile(token.Token);

                var uCount = connection.Execute("update users set password = @password where userid = @userid", new
                    {
                        user.UserId,
                        user.Password
                    });
                Debug.Assert(uCount == 1, "update didn't work");

                CommandExecutor.ExecuteCommand(
                    new ResetPasswordEmailCommand(new ResetPasswordEmailCommand.MailTemplate(new[] {user.UserName},
                                                                                             new[] {"no-reply@utah.gov"},
                                                                                             user.Name, token.Token)));
            }

            return Request.CreateResponse(HttpStatusCode.OK);
        }
    }
}