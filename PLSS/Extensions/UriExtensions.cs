using System;

namespace PLSS.Extensions
{
    public static class UriExtensions
    {
        public static Uri Combine(this Uri uri, string combine)
        {
            var baseUri = new UriBuilder(uri);
            Uri result;

            baseUri = !uri.AbsoluteUri.EndsWith("/") ?
                new UriBuilder(uri.AbsoluteUri + "/") :
                baseUri;

            combine = combine.StartsWith("/") ?
                combine.Remove(combine.IndexOf('/'), 1) :
                combine;

            if (Uri.TryCreate(baseUri.Uri, combine, out result))
            {
                result = result.AbsoluteUri.EndsWith("/") ?
                    new Uri(result.AbsoluteUri.Remove(result.AbsoluteUri.LastIndexOf('/'), 1)) :
                    result;

                return result;
            }
            
            throw new ArgumentException("Unable to combine specified url values");
        }
    }
}