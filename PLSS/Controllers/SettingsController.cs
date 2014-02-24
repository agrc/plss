using System.Collections.Generic;
using System.Configuration;
using System.Data.SqlClient;
using System.Diagnostics;
using System.IO;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Web.Mvc;
using AutoMapper;
using CommandPattern;
using Dapper;
using PLSS.Commands.Queries;
using PLSS.Extensions;
using PLSS.FormsAuthentication;
using PLSS.Models.ViewModel;

namespace PLSS.Controllers
{
    [RoutePrefix("secure")]
    public class SettingsController : Controller
    {
        [Route("settings", Name = "settings")]
        public async Task<ActionResult> Index()
        {
            using (var connection = new SqlConnection(ConfigurationManager.ConnectionStrings["PLSS"].ConnectionString))
            {
                await connection.OpenAsync();

                var user = CommandExecutor.ExecuteCommand(new GetUserCommand(connection, User.Identity.Name)
                    {
                        DefaultFields = "FirstName,LastName,UserName,SurveryorLicenseNumber,SurveyorSeal"
                    });

                if (user == null)
                {
                    TempData["error"] = "You must log in to edit your settings";

                    return RedirectToRoute("", new
                        {
                            Controller = "Home",
                            Action = "Index"
                        });
                }

                return View(Mapper.Map<ProfileUserViewModel>(user));
            }
        }

        [Route("settings/update")]
        public async Task<ActionResult> Update(ProfileUserViewModel model)
        {
            model.Validate(ModelState);

            if (!ModelState.IsValid)
            {
                TempData["error"] = ModelState.ToErrors();

                return RedirectToRoute("", new
                {
                    Controller = "settings",
                    Action = "index"
                });
            }

            var formsAuth = new FormsAuthenticationWrapper();

            using (var connection = new SqlConnection(ConfigurationManager.ConnectionStrings["PLSS"].ConnectionString))
            {
                await connection.OpenAsync();

                var user = CommandExecutor.ExecuteCommand(new GetUserCommand(connection, User.Identity.Name)
                    {
                        DefaultFields = "userid, username, password"
                    });

                if (user == null)
                {
                    TempData["error"] = "You must log in to edit your settings";

                    return RedirectToRoute("", new
                        {
                            Controller = "Home",
                            Action = "Index"
                        });
                }

                //changing usernames
                if (user.UserName != model.Email)
                {
                    var emailExists = CommandExecutor.ExecuteCommand(new GetUserCommand(connection, model.Email));
                    // make sure username isn't in use
                    if (emailExists != null)
                    {
                        TempData["error"] = new List<KeyValuePair<string, string>>
                            {
                                new KeyValuePair<string, string>("Email", "This email address is already in use")
                            };

                        return RedirectToRoute("", new
                        {
                            Controller = "settings",
                            Action = "index"
                        });
                    }

                    // otherwise sign them in with the new address
                    formsAuth.SignOut();

                    formsAuth.SetAuthCookie(model.Email, false);
                }

                // changing passwords
                if (!string.IsNullOrEmpty(model.CurrentPassword))
                {
                    model.HashedPassword = formsAuth.HashPasswordForStoringInConfigFile(model.NewPassword);
                }

                var re = new Regex(".jpg$", RegexOptions.IgnoreCase);
                    
                if (model.File != null && model.File.ContentLength > 0 && re.IsMatch(model.File.FileName))
                {
                    using (var ms = new MemoryStream())
                    {
                        model.File.InputStream.CopyTo(ms);
                        model.Seal = ms.ToArray();
                    }
                }

                // update the values
                var uCount = connection.Execute(model.UpdateString, new
                    { 
                        model.Email,
                        model.First,
                        model.Last,
                        model.License,
                        model.HashedPassword,
                        model.Seal,
                        user.UserId
                    });
                Debug.Assert(uCount == 1, "updates was wrong.");

                return RedirectToRoute("", new
                {
                    Controller = "settings",
                    Action = "index"
                });
            }
        }
    }
}