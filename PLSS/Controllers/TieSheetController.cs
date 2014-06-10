using System;
using System.Configuration;
using System.Data.SqlClient;
using System.Diagnostics;
using System.Dynamic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Mime;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Web.Mvc;
using CommandPattern;
using ConfigR;
using Dapper;
using NLog;
using O2S.Components.PDF4NET;
using PLSS.Commands.Email;
using PLSS.Commands.Queries;
using PLSS.Extensions;
using PLSS.Models;
using PLSS.Models.ViewModel;
using PLSS.Models.WebServiceModel;
using PLSS.Services.Ftp;
using PLSS.Services.Pdf;
using RestSharp;

namespace PLSS.Controllers
{
    [RoutePrefix("secure"), Authorize]
    public class TieSheetController : Controller
    {
        private static readonly Logger Log = LogManager.GetCurrentClassLogger();

        [Route("tiesheet", Name = "new"), HttpGet]
        public async Task<ActionResult> New(string blmid, string message)
        {
            var connection = new SqlConnection(ConfigurationManager.ConnectionStrings["PLSS"].ConnectionString);
            try
            {
                await connection.OpenAsync();

                if (string.IsNullOrEmpty(User.Identity.Name))
                {
                    TempData["error"] = "You must log in to submit a corner";

                    return RedirectToRoute("", new
                        {
                            Controller = "Home",
                            Action = "Index"
                        });
                }

                var user = CommandExecutor.ExecuteCommand(new GetUserCommand(connection, User.Identity.Name)
                    {
                        DefaultFields = "UserName,SurveryorLicenseNumber,SurveyorSeal"
                    });

                if (user == null)
                {
                    TempData["error"] = "You must log in to submit a corner";

                    return RedirectToRoute("", new
                        {
                            Controller = "Home",
                            Action = "Index"
                        });
                }

                dynamic viewModel = new ExpandoObject();

                viewModel.user = user;
                viewModel.blmid = blmid;

                if (user.SurveyorSeal != null && user.SurveyorSeal.Length > 0)
                {
                    viewModel.SurveyorSeal =
                        string.Format("<div class=\"col-xs-offset-4\"><img src=\"data:image/png;base64,{0}\" /></div>",
                                      Convert.ToBase64String(user.SurveyorSeal));
                }
                else
                {
                    viewModel.SurveyorSeal = "";
                }

#if RELEASE
                viewModel.apikey = Config.Global.Get<string>("prodKey");
#endif
#if STAGE
                viewModel.apikey = Config.Global.Get<string>("stageKey");
#endif
#if DEBUG
                viewModel.apikey = Config.Global.Get<string>("devKey");
                viewModel.Scripts = new[]
                    {
                        string.Format("<script data-dojo-config='isDebug: 1, deps:[\"app/runTiesheet\"]' src='{0}'></script>", Url.Content("~/src/dojo/dojo.js")),
                        string.Format("<script src='{0}'></script>", Url.Content("~/src/populatr/populatr.min.js"))
                    };
#endif

#if !DEBUG
            viewModel.Scripts = new[]{
                string.Format("<script data-dojo-config='async: 1, deps: [\"app/runTiesheet\"]' src='{0}'></script>", Url.Content("~/dist/app/Tiesheet.js"))
            };
#endif

                return View("New", viewModel);
            }
            catch (SqlException ex)
            {
                Log.LogException(LogLevel.Fatal, "problem with database", ex);

                TempData["error"] = string.Format("Unable to reach our user database. {0}", ex.Message);

                return RedirectToRoute("", new
                    {
                        Controller = "Home",
                        Action = "Index"
                    });
            }
            finally
            {
                connection.Close();
                connection.Dispose();
            }
        }

        [Route("tiesheet"), HttpPost]
        public async Task<ActionResult> New(CornerViewModel cornerViewModel)
        {
            #region validate input 

            if (!ModelState.IsValid)
            {
                TempData["error"] = ModelState.ToErrors();

                return RedirectToRoute("", new
                    {
                        Controller = "Home",
                        Action = "Index"
                    });
            }

            #endregion

            if (Request.Form["submitType"] == "preview")
            {
                return await Preview(cornerViewModel);
            }

            var connection = new SqlConnection(ConfigurationManager.ConnectionStrings["PLSS"].ConnectionString);
            PDFDocument pdf;
            TieSheetPdfModel model;
            try
            {
                await connection.OpenAsync();

                var user = CommandExecutor.ExecuteCommand(new GetUserCommand(connection, User.Identity.Name));

                if (user == null)
                {
                    TempData["error"] = "You must log in to submit a corner";

                    return RedirectToRoute("", new
                        {
                            Controller = "Home",
                            Action = "Index"
                        });
                }

                cornerViewModel.User = user;

                var corner = new Corner(cornerViewModel);

                var grid = new Grid(cornerViewModel.Grid);
                var coordinate = new Coordinate(cornerViewModel.Coordinate);
                var formInfo = new FormInfo(user.Name, corner.BlmPointId);
                var photos = new Photo(cornerViewModel);

                corner.CoordinateId = coordinate.CoordinateId;
                corner.GridId = grid.GridId;
                corner.FormInfoId = formInfo.FormInfoId;
                corner.PhotoId = photos.PhotoId;

                var gInserts = connection.Execute(Grid.InsertString, grid);
                Debug.Assert(gInserts == 1, "inserted into grid successfully");
                var cInserts = connection.Execute(Coordinate.InsertString, coordinate);
                Debug.Assert(cInserts == 1, "inserted into coords successfully");
                var fInserts = connection.Execute(FormInfo.InsertString, formInfo);
                Debug.Assert(fInserts == 1, "inserted into form successfully");
                var pInserts = connection.Execute(Photo.InsertString, photos);
                Debug.Assert(pInserts == 1, "inserted into photo successfully");
                var cornInserts = connection.Execute(Corner.InsertString, corner);
                Debug.Assert(cornInserts == 1, "inserted into corners successfully");

                model = new TieSheetPdfModel(cornerViewModel, corner, photos);
                var pdfService = new PlssPdfService("Assets\\pdf");
                pdf = pdfService.HydratePdfForm("MonumentStatusTemplate.pdf", model);
#if DEBUG
                pdf.FlattenFormFields();
#endif
                var ftpService = new FtpService(Config.Global.Get<string>("FtpUser"),
                                                Config.Global.Get<string>("FtpPassword"),
                                                Config.Global.Get<string>("FtpUrl"));

                var ftpStatusCode = FtpStatusCode.Undefined;
                string actualPath = null;
                try
                {
                    ftpStatusCode = ftpService.Upload(pdf.GetPDFAsByteArray(), formInfo.Path, out actualPath);
                }
                catch (Exception ex)
                {
                    Log.LogException(LogLevel.Fatal, string.Format("problem uploading pdf for {0}", cornerViewModel), ex);

                    //do nothing, email will get sent about issue and we'll rebuild pdf form later.
                }

                var uploadedSuccessfully = false;
                if (ftpStatusCode == FtpStatusCode.ClosingData)
                {
                    uploadedSuccessfully = true;

                    CommandExecutor.ExecuteCommand(new UserSubmittedEmailCommand(
                                                       new UserSubmittedEmailCommand.MailTemplate(App.AdminEmails,
                                                                                                  new[] {user.UserName},
                                                                                                  user.Name,
                                                                                                  model.BlmPointId,
                                                                                                  model.CollectionDate,
                                                                                                  actualPath)));
                }
                else
                {
                    CommandExecutor.ExecuteCommand(new UserSubmitionFailedEmailCommand(
                                                       new UserSubmitionFailedEmailCommand.MailTemplate(App.AdminEmails,
                                                                                                        new[]
                                                                                                            {
                                                                                                                user.
                                                                                                            UserName
                                                                                                            },
                                                                                                        user.Name,
                                                                                                        model.BlmPointId,
                                                                                                        model.
                                                                                                            CollectionDate)));
                }

                var cUpdate = connection.Execute(
                    "update FormInfoes set " +
                    "path = @actualpath, " +
                    "uploadedSuccessfully = @uploadedSuccessfully " +
                    "where forminfoid = @FormInfoId", new
                        {
                            actualPath,
                            formInfo.FormInfoId,
                            uploadedSuccessfully
                        });
                Debug.Assert(cUpdate == 1, "updated form infos correctly");
            }
            catch (Exception ex)
            {
                Log.LogException(LogLevel.Fatal, string.Format("problem saving new corner for {0}", cornerViewModel), ex);

                TempData["error"] = ex.Message;

                return RedirectToRoute("", new
                    {
                        Controller = "Home",
                        Action = "Index"
                    });
            }
            finally
            {
                connection.Close();
                connection.Dispose();
            }

            return RedirectToRoute("", new
            {
                Controller = "Home",
                Action = "Index"
            });
        }

        [Route("tiesheet/preview"), HttpPost]
        public async Task<ActionResult> Preview(CornerViewModel cornerViewModel)
        {
            #region validate input

            if (!ModelState.IsValid)
            {
                TempData["error"] = "There was a problem with your input. Please try again.";

                return RedirectToAction("Index");
            }

            #endregion

            var connection = new SqlConnection(ConfigurationManager.ConnectionStrings["PLSS"].ConnectionString);
            PDFDocument pdf = null;
            try
            {
                await connection.OpenAsync();

                var user = CommandExecutor.ExecuteCommand(new GetUserCommand(connection, User.Identity.Name));

                if (user == null)
                {
                    TempData["error"] = "You must log in to submit a corner";

                    return RedirectToRoute("", new
                        {
                            Controller = "Home",
                            Action = "Index"
                        });
                }

                cornerViewModel.User = user;

                var corner = new Corner(cornerViewModel);
                var photos = new Photo(cornerViewModel);
                var model = new TieSheetPdfModel(cornerViewModel, corner, photos);

                var pdfService = new PlssPdfService("Assets\\pdf");
                pdf = pdfService.HydratePdfForm("MonumentStatusTemplate.pdf", model);
#if DEBUG
                pdf.FlattenFormFields();
#endif

                return File(pdf.GetPDFAsByteArray(),
                            MediaTypeNames.Application.Pdf,
                            string.Format("{0}-preview.pdf", model.BlmPointId));
            }
            catch (Exception ex)
            {
                Log.LogException(LogLevel.Fatal, string.Format("problem previewing pdf for {0}", cornerViewModel), ex);

                TempData["error"] = string.Format("There was a problem generating your preview. {0}", ex.Message);

                return RedirectToRoute("", new
                    {
                        Controller = "Home",
                        Action = "Index"
                    });
            }
            finally
            {
                if (pdf != null)
                {
                    pdf.Dispose();
                }

                connection.Close();
                connection.Dispose();
            }
        }

        [Route("tiesheet/existing", Name = "existing"), HttpGet]
        public async Task<ActionResult> Existing(string blmid)
        {
            var connection = new SqlConnection(ConfigurationManager.ConnectionStrings["PLSS"].ConnectionString);
            User user;
            try
            {
                await connection.OpenAsync();

                user = CommandExecutor.ExecuteCommand(new GetUserCommand(connection, User.Identity.Name));

                if (user == null)
                {
                    TempData["error"] = "You must log in to submit a corner";

                    return RedirectToRoute("", new
                        {
                            Controller = "Home",
                            Action = "Index"
                        });
                }
            }
            catch (Exception ex)
            {
                Log.LogException(LogLevel.Fatal, string.Format("problem showing existing page for {0}", blmid), ex);
                throw;
            }
            finally
            {
                connection.Close();
                connection.Dispose();
            }

            dynamic viewModel = new ExpandoObject();
            viewModel.user = user;
            viewModel.BlmPointId = blmid;

            return View(viewModel);
        }

        [Route("tiesheet/existing"), HttpPost]
        public async Task<ActionResult> Existing(ExistingFormViewModel exitingViewModel)
        {
            #region validate input

            if (!ModelState.IsValid)
            {
                TempData["error"] = ModelState.ToErrors();

                if (!string.IsNullOrEmpty(exitingViewModel.BlmPointId))
                {
                    return RedirectToAction("Existing", new
                        {
                            blmid = exitingViewModel.BlmPointId
                        });
                }

                return RedirectToRoute("", new
                    {
                        Controller = "Home",
                        Action = "Index"
                    });
            }

            #endregion

            var re = new Regex(".pdf$", RegexOptions.IgnoreCase);
            if (exitingViewModel.MonumentForm == null ||
                exitingViewModel.MonumentForm.ContentLength <= 0 ||
                !re.IsMatch(exitingViewModel.MonumentForm.FileName))
            {
                TempData["error"] = "Please upload a PDF.";

                return RedirectToAction("Existing", new
                    {
                        blmid = exitingViewModel.BlmPointId
                    });
            }

            var connection = new SqlConnection(ConfigurationManager.ConnectionStrings["PLSS"].ConnectionString);
            User user;
            try
            {
                await connection.OpenAsync();

                user = CommandExecutor.ExecuteCommand(new GetUserCommand(connection, User.Identity.Name));

                if (user == null)
                {
                    TempData["error"] = "You must log in to submit corner information";

                    return RedirectToRoute("", new
                        {
                            Controller = "Home",
                            Action = "Index"
                        });
                }
            }
            catch (Exception ex)
            {
                Log.LogException(LogLevel.Fatal, "problem getting user", ex);
                throw;
            }
            finally
            {
                connection.Close();
                connection.Dispose();
            }

            byte[] pdfBytes;
            using (var binaryReader = new BinaryReader(exitingViewModel.MonumentForm.InputStream))
            {
                pdfBytes = binaryReader.ReadBytes(exitingViewModel.MonumentForm.ContentLength);
            }

            var path = Path.Combine("UserCommittedTieSheets",
                                    user.Name,
                                    DateTime.Now.ToShortDateString().Replace("/", "-"),
                                    exitingViewModel.BlmPointId).Replace(@"\", "/") + ".pdf";

            var ftpService = new FtpService(Config.Global.Get<string>("FtpUser"),
                                            Config.Global.Get<string>("FtpPassword"),
                                            Config.Global.Get<string>("FtpUrl"));
            var ftpStatusCode = FtpStatusCode.Undefined;
            string actualPath;

            Log.Info("Uploading PDF");
            try
            {
                ftpStatusCode = ftpService.Upload(pdfBytes, path, out actualPath);
            }
            catch (Exception ex)
            {
                Log.LogException(LogLevel.Fatal, string.Format("problem uploading pdf {1} for {0}", exitingViewModel, ftpStatusCode), ex);

                //show error and redirect to page
                TempData["error"] = string.Format("There was a problem uploading your document. Please try again. {0}",
                                                  ex.Message);

                return RedirectToRoute("", new
                    {
                        Controller = "Home",
                        Action = "Index"
                    });
            }
            Log.Info("Checking upload status");

            if (ftpStatusCode != FtpStatusCode.ClosingData)
            {
                TempData["error"] = "There was a problem uploading your document. Please try again.";

                return RedirectToRoute("", new
                    {
                        Controller = "Home",
                        Action = "Index"
                    });
            }

            Log.Info("Sending admin notification email");

            CommandExecutor.ExecuteCommand(new UserSubmittedEmailCommand(
                                               new UserSubmittedEmailCommand.MailTemplate(App.AdminEmails,
                                                                                          new[] {user.UserName},
                                                                                          user.Name,
                                                                                          exitingViewModel.BlmPointId,
                                                                                          DateTime.Now.ToShortDateString
                                                                                              (),
                                                                                          actualPath)));

#if RELEASE
                var apikey = Config.Global.Get<string>("prodKey");
                const string referrer = "http://mapserv.utah.gov/plss";
#endif
#if STAGE
                var apikey = Config.Global.Get<string>("stageKey");
                const string referrer = "http://test.mapserv.utah.gov/plss";
#endif
#if DEBUG
            var apikey = Config.Global.Get<string>("devKey");
            const string referrer = "http://localhost";
#endif
            Log.Info("Getting county from api with referrer {0} and api key {1}",referrer, apikey);
            //find what county the point is in
            string countyName;
            try
            {
                var client = new RestClient("http://api.mapserv.utah.gov/api/v1/");
                var request = new RestRequest("search/{layer}/{returnValues}", Method.GET);

                request.AddUrlSegment("layer", "SGID10.CADASTRE.PLSSPoint_AGRC");
                request.AddUrlSegment("returnValues", "xcoord, ycoord");
                request.AddParameter("predicate", string.Format("pointid = '{0}'", exitingViewModel.BlmPointId));
                request.AddParameter("attributeStyle", "lower");
                request.AddParameter("apiKey", apikey);

                request.AddHeader("Referer", referrer);
               
                var response = client.Execute<SearchApiContainer>(request);

                if (response.Data == null)
                {
                    Log.Warn(string.Format("problem querying webservice for blm point id {0}. {1}", client.BuildUri(request), response.ErrorMessage));

                    TempData["message"] = "Monument saved successfully but the county contact was not notfied.";

                    return RedirectToRoute("", new
                    {
                        Controller = "Home",
                        Action = "Index"
                    });
                }

                if (response.Data.result == null)
                {
                    Log.Warn(string.Format("problem querying webservice for blm point id {0}. {1}", client.BuildUri(request), response.Content));

                    TempData["message"] = "Monument saved successfully but the county contact was not notfied.";

                    return RedirectToRoute("", new
                    {
                        Controller = "Home",
                        Action = "Index"
                    });
                }

                var searchApiResult = response.Data.result.FirstOrDefault();

                if (searchApiResult == null)
                {
                    Log.Warn(string.Format("problem querying webservice for blm point id {0}. {1}", client.BuildUri(request), response.Content));

                    TempData["message"] = "Monument saved successfully but the county contact was not notfied.";

                    return RedirectToRoute("", new
                        {
                            Controller = "Home",
                            Action = "Index"
                        });
                }

                var xcoord = searchApiResult.attributes["xcoord"];
                var ycoord = searchApiResult.attributes["ycoord"];

                request = new RestRequest("search/{layer}/{returnValues}");
                request.AddUrlSegment("layer", "SGID10.BOUNDARIES.Counties");
                request.AddUrlSegment("returnValues", "NAME");
                request.AddParameter("attributeStyle", "lower");

                request.AddParameter("geometry", string.Format("point:[{0},{1}]", xcoord, ycoord));

                request.AddParameter("spatialReference", "4326");
                request.AddParameter("apiKey", apikey);

                request.AddHeader("Referer", referrer);

                var county = client.Execute<SearchApiContainer>(request);

                if (county.Data == null)
                {
                    Log.Warn(string.Format("problem querying webservice forcounty {0}. {1}", client.BuildUri(request), county.ErrorMessage));

                    TempData["message"] = "Monument saved successfully but the county contact was not notfied.";

                    return RedirectToRoute("", new
                    {
                        Controller = "Home",
                        Action = "Index"
                    });
                }

                if (county.Data.result == null)
                {
                    Log.Warn(string.Format("problem querying webservice for county {0}. {1}", client.BuildUri(request), county.Content));

                    TempData["message"] = "Monument saved successfully but the county contact was not notfied.";

                    return RedirectToRoute("", new
                    {
                        Controller = "Home",
                        Action = "Index"
                    });
                }

                var countResult = county.Data.result.FirstOrDefault();
                if (countResult == null)
                {
                    Log.Warn(string.Format("problem querying webservice for county {0}", client.BuildUri(request)));

                    TempData["message"] = "Monument saved successfully but the county contact was not notfied.";

                    return RedirectToRoute("", new
                        {
                            Controller = "Home",
                            Action = "Index"
                        });
                }

                countyName = countResult.attributes["name"].ToUpper();
            }
            catch (Exception ex)
            {
                Log.LogException(LogLevel.Fatal, string.Format("problem uploading pdf for {0}", exitingViewModel), ex);

                TempData["message"] = "Monument saved successfully but the county contact was not notfied.";

                return RedirectToRoute("", new
                    {
                        Controller = "Home",
                        Action = "Index"
                    });
            }

            //get the county contact for that submission
            CountyContact contact;
            using (connection = new SqlConnection(ConfigurationManager.ConnectionStrings["PLSS"].ConnectionString))
            {
                await connection.OpenAsync();

                contact = connection.Query<CountyContact>(
                    "Select FullName, Email from Lookup_CountyContacts where County = @countyName",
                    new
                        {
                            countyName
                        }).SingleOrDefault();

                if (contact == null)
                {
                    Log.Warn("problem finding a county contact for {0}", countyName);

                    TempData["message"] = "Monument saved successfully but the county contact was not notfied.";

                    return RedirectToRoute("", new
                        {
                            Controller = "Home",
                            Action = "Index"
                        });
                }
            }

            //send county contact an email with link to pdf or attachment
            var file = new FileInfo(actualPath);
            CommandExecutor.ExecuteCommand(new NotifyCountyEmailCommand(
                                               new NotifyCountyEmailCommand.MailTemplate(new[] {contact.Email},
                                                                                         App.AdminEmails,
                                                                                         contact.FullName,
                                                                                         user.Name,
                                                                                         exitingViewModel.BlmPointId,
                                                                                         countyName,
                                                                                         pdfBytes,
                                                                                         file.Name)));


            TempData["message"] = "Monument saved successfully.";

            return RedirectToRoute("", new
                {
                    Controller = "Home",
                    Action = "Index"
                });
        }
    }
}