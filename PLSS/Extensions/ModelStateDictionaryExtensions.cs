using System.Web.Http.ModelBinding; 
using System;
using System.Collections.Generic;
using System.Linq;

namespace PLSS.Extensions
{
    public static class ModelStateDictionaryExtensions
    {
        public static IEnumerable<KeyValuePair<string,string>> ToErrors(this ModelStateDictionary dict)
        {
            return dict.SelectMany(kvp => kvp.Value.Errors.Select(e => Tuple.Create(kvp.Key, e.ErrorMessage)))
                       .Select(tuple => new KeyValuePair<string, string>(tuple.Item1, tuple.Item2));
        }

        public static IEnumerable<KeyValuePair<string, string>> ToErrors(this System.Web.Mvc.ModelStateDictionary dict)
        {
            return dict.SelectMany(kvp => kvp.Value.Errors.Select(e => Tuple.Create(kvp.Key, e.ErrorMessage)))
                       .Select(tuple => new KeyValuePair<string, string>(tuple.Item1, tuple.Item2));
        }
    }
}