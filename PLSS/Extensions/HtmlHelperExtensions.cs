using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web.Mvc;
using System.Web.UI;

namespace PLSS.Extensions
{
    public static class HtmlHelperExtensions
    {
        public static MvcHtmlString ErrorBox(this HtmlHelper htmlHelper, TempDataDictionary errorViewData)
        {
            var possibleError = errorViewData["error"] as string;

            if (possibleError != null && !string.IsNullOrEmpty(possibleError))
            {
                return BuildFromString(possibleError);

            }

            var possibleErrorList = errorViewData["error"] as IEnumerable<KeyValuePair<string, string>>;

            if (possibleErrorList != null && possibleErrorList.Any())
            {
                return BuildFromList(possibleErrorList);

            }
            
            return MvcHtmlString.Empty;
        }

        private static MvcHtmlString BuildFromList(IEnumerable<KeyValuePair<string, string>> possibleError)
        {
            using (var writer = new HtmlTextWriter(new StringWriter()))
            {
                writer.AddAttribute("class", "alert alert-danger");

                writer.RenderBeginTag(HtmlTextWriterTag.Div);
                writer.Write(string.Join(" ", possibleError.Select(x => x.Value)));

                writer.RenderEndTag();

                return MvcHtmlString.Create(writer.InnerWriter.ToString());
            }
        }

        private static MvcHtmlString BuildFromString(string possibleError)
        {
            using (var writer = new HtmlTextWriter(new StringWriter()))
            {
                writer.AddAttribute("class", "alert alert-danger");

                writer.RenderBeginTag(HtmlTextWriterTag.Div);
                writer.Write(possibleError);

                writer.RenderEndTag();

                return MvcHtmlString.Create(writer.InnerWriter.ToString());
            }
        }
    }
}