using System.Collections.Generic;

namespace PLSS.Models.WebServiceModel
{
    public class SearchApiContainer
    {
        public List<SearchApiResult> result { get; set; }
        public int status { get; set; }
    }
}