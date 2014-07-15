using System;
using System.Configuration;
using System.Data.SqlClient;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using System.Web.Mvc;
using Dapper;
using NLog;
using O2S.Components.PDF4NET;
using PLSS.Models;
using PLSS.Services.Pdf;

namespace PLSS.Controllers
{
    public class ReviewController : Controller
    {
        private static readonly Logger Log = LogManager.GetCurrentClassLogger();

        [Route("tiesheet/review/{id}", Name = "review"), HttpGet]
        public async Task<ActionResult> Review(Guid id)
        {
            var connection = new SqlConnection(ConfigurationManager.ConnectionStrings["PLSS"].ConnectionString);
            PDFDocument pdf;

            try
            {
                await connection.OpenAsync();
                var corners =
                    await connection.QueryAsync<Corner>("select BlmPointId,CollectionDate,SectionCorner,Township," +
                                                        "BaseMeridian,County,Datum,Accuracy,Description,MonumentStatus," +
                                                        "Photos_PhotoId as PhotoId,Grid_GridId as Gridid, UserId, " +
                                                        "Coordinate_CoordinateId as CoordinateId from Corners where cornerid = @id", new { id });
                var corner = corners.SingleOrDefault();

                if (corner == null)
                {
                    return new HttpStatusCodeResult(HttpStatusCode.NotFound);
                }

                var photos = await
                             connection.QueryAsync<Photo>("Select * from Photos where photoid = @id",
                                                          new { id = corner.PhotoId });
                var photo = photos.SingleOrDefault();

                var users = await
                            connection.QueryAsync<User>("Select * from Users where userid = @id",
                                                        new { id = corner.UserId });
                var user = users.SingleOrDefault();

                var grids = await
                            connection.QueryAsync<Grid>("Select * from Grids where gridid = @id",
                                                        new { id = corner.GridId });
                var grid = grids.SingleOrDefault();

                var cords = await
                            connection.QueryAsync<Coordinate>("Select * from Coordinates where coordinateid = @id",
                                                              new { id = corner.CoordinateId });
                var cord = cords.SingleOrDefault();

                var pdfService = new PlssPdfService("Assets\\pdf");

                pdf = pdfService.RebuildPdfFrom("MonumentStatusTemplate.pdf", photo, user, corner, grid, cord);
            }
            catch (Exception ex)
            {
                Log.LogException(LogLevel.Fatal, string.Format("problem reviewing page for {0}", id), ex);
                throw;
            }
            finally
            {
                connection.Close();
                connection.Dispose();
            }

            return File(pdf.GetPDFAsByteArray(), "application/pdf", "Review.pdf");
        }

    }
}
