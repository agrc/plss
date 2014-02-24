using System.ComponentModel.DataAnnotations;
using System.Web;

namespace PLSS.Models.ViewModel
{
    public class ExistingFormViewModel
    {
        [Required(ErrorMessage = "BlmPointId is required", AllowEmptyStrings = false)]
        public string BlmPointId { get; set; }

        [Required(ErrorMessage = "You must upload a file")]
        public HttpPostedFileBase MonumentForm { get; set; }

        public override string ToString()
        {
            return string.Format("BlmPointId: {0}", BlmPointId);
        }
    }
}