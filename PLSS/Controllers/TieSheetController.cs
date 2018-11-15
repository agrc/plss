﻿using System;
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
using PLSS.Services;
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
            Log.Info("Showing tie sheet for {0}", blmid);

            var connection = new SqlConnection(ConfigurationManager.ConnectionStrings["PLSS"].ConnectionString);
            try
            {
                await connection.OpenAsync();

                if (string.IsNullOrEmpty(User.Identity.Name))
                {
                    Log.Info("user has no identity, redirecting to home page");

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
                    Log.Info("user not found, redirecting to home page");

                    TempData["error"] = "You must log in to submit a corner";

                    return RedirectToRoute("", new
                    {
                        Controller = "Home",
                        Action = "Index"
                    });
                }

                Log.Info("showing tiesheet for user, {0}", user.UserName);

                dynamic viewModel = new ExpandoObject();

                viewModel.user = user;
                viewModel.blmid = blmid;

                if (user.SurveyorSeal != null && user.SurveyorSeal.Length > 0)
                {
                    viewModel.SurveyorSeal =
                        $"<div class=\"col-xs-offset-4\"><img src=\"data:image/png;base64,{Convert.ToBase64String(user.SurveyorSeal)}\" /></div>";
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
                        $"<script data-dojo-config='isDebug: 1, deps:[\"app/run\"]' src='{Url.Content("~/src/dojo/dojo.js")}'></script>",
                        $"<script src='{Url.Content("~/src/populatr/populatr.min.js")}'></script>"
                    };
#endif

#if !DEBUG
            viewModel.Scripts = new[]{
                string.Format("<script data-dojo-config='async: 1, deps: [\"app/runTiesheet\"]' src='{0}'></script>", Url.Content("~/dist/dojo/tiesheet.js"))
            };
#endif

                return View("New", viewModel);
            }
            catch (SqlException ex)
            {
                Log.LogException(LogLevel.Fatal, "problem with database", ex);

                TempData["error"] = $"Unable to reach our user database. {ex.Message}";

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
                Log.Info("Showing preview for {0}", cornerViewModel.BlmPointId);

                return await Preview(cornerViewModel);
            }

            var connection = new SqlConnection(ConfigurationManager.ConnectionStrings["PLSS"].ConnectionString);
            try
            {
                await connection.OpenAsync();

                var user = CommandExecutor.ExecuteCommand(new GetUserCommand(connection, User.Identity.Name));

                if (user == null)
                {
                    Log.Info("Could not find user {0} redirecting to home.", User.Identity.Name);

                    TempData["error"] = "You must log in to submit a corner";

                    return RedirectToRoute("", new
                        {
                            Controller = "Home",
                            Action = "Index"
                        });
                }

                Log.Info("Submitting tiesheet for {0}", user.Name);

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

                var model = new TieSheetPdfModel(cornerViewModel, corner, photos);
                var pdfService = new PlssPdfService("Assets\\pdf");
                var pdf = pdfService.HydratePdfForm("MonumentStatusTemplate.pdf", model);
#if DEBUG
                pdf.FlattenFormFields();
#endif
                Log.Info("finished created database models");

                var actualPath = Path.Combine(Config.Global.Get<string>("SharePath"), formInfo.Path);
                Log.Info($"Writing PDF to: {actualPath}");
                var success = FileSaver.SaveFile(actualPath, pdf.GetPDFAsByteArray());

                if (!success)
                {
                    Log.Fatal($"problem saving pdf for {cornerViewModel}");

                    //do nothing, email will get sent about issue and we'll rebuild pdf form later.
                    Log.Info("Sending failed notification email to {0}", string.Join(", ", App.AdminEmails));

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
                else { 
                    CommandExecutor.ExecuteCommand(new UserSubmittedEmailCommand(
                                                       new UserSubmittedEmailCommand.MailTemplate(App.AdminEmails,
                                                                                                  new[] {user.UserName},
                                                                                                  user.Name,
                                                                                                  model.BlmPointId,
                                                                                                  model.CollectionDate,
                                                                                                  actualPath)));
                }

                Log.Info("updating forminfoes table path: {0}", actualPath, success);

                var cUpdate = connection.Execute(
                    "update FormInfoes set " +
                    "path = @actualpath, " +
                    "uploadedSuccessfully = @success " +
                    "where forminfoid = @FormInfoId", new
                        {
                            actualPath,
                            formInfo.FormInfoId,
                            success
                    });
                Debug.Assert(cUpdate == 1, "updated form infos correctly");
            }
            catch (Exception ex)
            {
                Log.LogException(LogLevel.Fatal, $"problem saving new corner for {cornerViewModel}", ex);

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
                            $"{model.BlmPointId}-preview.pdf");
            }
            catch (Exception ex)
            {
                Log.LogException(LogLevel.Fatal, $"problem previewing pdf for {cornerViewModel}", ex);

                TempData["error"] = $"There was a problem generating your preview. {ex.Message}";

                return RedirectToRoute("", new
                    {
                        Controller = "Home",
                        Action = "Index"
                    });
            }
            finally
            {
                pdf?.Dispose();

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
                Log.LogException(LogLevel.Fatal, $"problem showing existing page for {blmid}", ex);
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
            var actualPath = Path.Combine(Config.Global.Get<string>("SharePath"), path);

            Log.Info($"Writing PDF to: {actualPath}");
            var success = FileSaver.SaveFile(actualPath, pdfBytes);

            if (!success)
            {
                //show error and redirect to page
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
                                                                                          DateTime.Now.ToShortDateString(),
                                                                                          actualPath)));

#if RELEASE
                var apikey = Config.Global.Get<string>("prodKey");
                const string referrer = "http://plss.utah.gov/";
#endif
#if STAGE
                var apikey = Config.Global.Get<string>("stageKey");
                const string referrer = "http://test.mapserv.utah.gov/plss";
#endif
#if DEBUG
            var apikey = Config.Global.Get<string>("devKey");
            const string referrer = "http://localhost";
#endif
            Log.Info("Getting county from api with referrer {0} and api key {1}", referrer, apikey);
            //find what county the point is in
            string countyName;
            try
            {
                var client = new RestClient("http://api.mapserv.utah.gov/api/v1/");
                var request = new RestRequest("search/{layer}/{returnValues}", Method.GET);

                request.AddUrlSegment("layer", "SGID10.CADASTRE.PLSSPoint_AGRC");
                request.AddUrlSegment("returnValues", "xcoord, ycoord");
                request.AddParameter("predicate", $"pointid = '{exitingViewModel.BlmPointId}'");
                request.AddParameter("attributeStyle", "lower");
                request.AddParameter("apiKey", apikey);

                request.AddHeader("Referer", referrer);
               
                var response = client.Execute<SearchApiContainer>(request);

                if (response.Data == null)
                {
                    Log.Warn($"problem querying webservice for blm point id {client.BuildUri(request)}. {response.ErrorMessage}");

                    TempData["message"] = "Monument saved successfully but the county contact was not notfied.";

                    return RedirectToRoute("", new
                    {
                        Controller = "Home",
                        Action = "Index"
                    });
                }

                if (response.Data.result == null)
                {
                    Log.Warn($"problem querying webservice for blm point id {client.BuildUri(request)}. {response.Content}");

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
                    Log.Warn($"problem querying webservice for blm point id {client.BuildUri(request)}. {response.Content}");

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

                request.AddParameter("geometry", $"point:[{xcoord},{ycoord}]");

                request.AddParameter("spatialReference", "4326");
                request.AddParameter("apiKey", apikey);

                request.AddHeader("Referer", referrer);

                var county = client.Execute<SearchApiContainer>(request);

                if (county.Data == null)
                {
                    Log.Warn($"problem querying webservice forcounty {client.BuildUri(request)}. {county.ErrorMessage}");

                    TempData["message"] = "Monument saved successfully but the county contact was not notfied.";

                    return RedirectToRoute("", new
                    {
                        Controller = "Home",
                        Action = "Index"
                    });
                }

                if (county.Data.result == null)
                {
                    Log.Warn($"problem querying webservice for county {client.BuildUri(request)}. {county.Content}");

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
                    Log.Warn($"problem querying webservice for county {client.BuildUri(request)}");

                    TempData["message"] = "Monument saved successfully but the county contact was not notfied.";

                    return RedirectToRoute("", new
                        {
                            Controller = "Home",
                            Action = "Index"
                        });
                }

                countyName = countResult.attributes["name"].ToUpper();
                Log.Info("County: {0}", countyName);
            }
            catch (Exception ex)
            {
                Log.LogException(LogLevel.Fatal, $"problem uploading pdf for {exitingViewModel}", ex);

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
            Log.Info("Sending county contact email to: {0}", contact.Email);
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
            Log.Info("Monument was saved successfully");
            
            return RedirectToRoute("", new
                {
                    Controller = "Home",
                    Action = "Index"
                });
        }
    }
}