//>>built
define(["dojo/_base/kernel","dojo/_base/declare","dojo/_base/lang","dojo/_base/array","dojo/sniff","dojo/string","dojox/xml/parser","esri/kernel","esri/lang","esri/request","esri/WKIDUnitConversion","esri/SpatialReference","esri/geometry/Point","esri/geometry/Extent","esri/geometry/webMercatorUtils","esri/layers/TiledMapServiceLayer","esri/layers/TileInfo","esri/layers/WMTSLayerInfo","dojo/query"],function(h,z,s,i,v,G,A,H,t,B,u,w,x,y,C,D,E,F){return z([D],{declaredClass:"esri.layers.WMTSLayer",copyright:null,extent:null,tileUrl:null,
spatialReference:null,tileInfo:null,constructor:function(a,b){this.version="1.0.0";this.tileUr=this._url=a;this.serviceMode="RESTful";this._parseCapabilities=s.hitch(this,this._parseCapabilities);this._getCapabilitiesError=s.hitch(this,this._getCapabilitiesError);b||(b={});if(b.serviceMode)if("KVP"===b.serviceMode||"RESTful"===b.serviceMode)this.serviceMode=b.serviceMode;else{console.error("WMTS mode could only be 'KVP' or 'RESTful'");return}this.layerInfo=new F;if(b.layerInfo){this.layerInfo=b.layerInfo;
this._identifier=b.layerInfo.identifier;this._tileMatrixSetId=b.layerInfo.tileMatrixSet;if(b.layerInfo.format)this.format="image/"+b.layerInfo.format;this._style=b.layerInfo.style;this.title=b.layerInfo.title}if(b.resourceInfo){this.version=b.resourceInfo.version;if(b.resourceInfo.getTileUrl)this._url=this.tileUrl=b.resourceInfo.getTileUrl;this.copyright=b.resourceInfo.copyright;this.layerInfos=b.resourceInfo.layerInfos;this._parseResourceInfo();this.loaded=!0;this.onLoad(this)}else this._getCapabilities();
this._formatDictionary={"image/png":".png","image/png8":".png","image/png24":".png","image/png32":".png","image/jpg":".jpg","image/jpeg":".jpeg","image/gif":".gif","image/bmp":".bmp","image/tiff":".tif","image/jpgpng":"","image/jpegpng":""}},setActiveLayer:function(a){this.setVisibleLayer(a)},setVisibleLayer:function(a){this._setActiveLayer(a);this.refresh(!0)},getTileUrl:function(a,b,e){var a=this._levelToLevelValue[a],c;if(this.resourceUrls&&0<this.resourceUrls.length)return c=this.resourceUrls[b%
this.resourceUrls.length].template,c=c.replace(/\{Style\}/gi,this._style),c=c.replace(/\{TileMatrixSet\}/gi,this._tileMatrixSetId),c=c.replace(/\{TileMatrix\}/gi,a),c=c.replace(/\{TileRow\}/gi,b),c=c.replace(/\{TileCol\}/gi,e);c=this.UrlTemplate.replace(/\{level\}/gi,a);c=c.replace(/\{row\}/gi,b);return c=c.replace(/\{col\}/gi,e)},getTileUrlTemplate:function(a){var b=a.identifier,e=a.tileMatrixSet,c=a.format,d=a.style;b?a=i.filter(this.layers,function(a){return a.identifier===b})[0]:(a=this.layers[0],
b=this.layers[0].identifier);if(a){if(c){if(-1===c.indexOf("image/")&&(c="image/"+c),-1===i.indexOf(a.formats,c)){console.error("The layer doesn't support the format of "+c);this.onError(Error("The layer doesn't support the format of "+c));return}}else c=a.formats[0],-1===c.indexOf("image/")&&(c="image/"+c);if(d){if(-1===i.indexOf(a.styles,d)){console.error("The layer doesn't support the style of "+d);this.onError(Error("The layer doesn't support the style of "+d));return}}else d=a.styles[0];var f;
if(e){if(f=i.filter(a.tileMatrixSetInfos,function(a){return a.tileMatrixSet===e})[0],!f){console.error("The tileMatrixSetId "+e+" is not supported by the layer of "+b);this.onError(Error("The tileMatrixSetId "+e+" is not supported by the layer of "+b));return}}else(f=i.filter(a.tileMatrixSetInfos,function(a){return"GoogleMapsCompatible"===a.tileMatrixSet})[0])||(f=a.tileMatrixSetInfos[0]),e=f.tileMatrixSet;return this._getTileUrlTemplate(b,e,c,d)}console.error("couldn't find the layer "+b);this.onError(Error("couldn't find the layer "+
b))},_getTileUrlTemplate:function(a,b,e,c){var d;if(!a)a=this._identifier;if(!b)b=this._tileMatrixSetId;if(!e)e=this.format;if(!c)c=this._style;if(this.resourceUrls&&0<this.resourceUrls.length)return d=this.resourceUrls[0].template,d=d.replace(/\{Style\}/gi,c),d=d.replace(/\{TileMatrixSet\}/gi,b),d=d.replace(/\{TileMatrix\}/gi,"{level}"),d=d.replace(/\{TileRow\}/gi,"{row}"),d=d.replace(/\{TileCol\}/gi,"{col}");"KVP"===this.serviceMode?d=this._url+"SERVICE=WMTS&VERSION="+this.version+"&REQUEST=GetTile&LAYER="+
a+"&STYLE="+c+"&FORMAT="+e+"&TILEMATRIXSET="+b+"&TILEMATRIX={level}&TILEROW={row}&TILECOL={col}":"RESTful"===this.serviceMode&&(d="",this._formatDictionary[e.toLowerCase()]&&(d=this._formatDictionary[e.toLowerCase()]),d=this._url+a+"/"+c+"/"+b+"/{level}/{row}/{col}"+d);return d},_parseResourceInfo:function(){var a=this.layerInfos,b;"KVP"===this.serviceMode&&(this._url+=-1<this._url.indexOf("?")?"":"?");for(b=0;b<a.length;b++)if((!this._identifier||a[b].identifier===this._identifier)&&(!this.title||
a[b].title===this.title)&&(!this._tileMatrixSetId||a[b].tileMatrixSet===this._tileMatrixSetId)&&(!this.format||"image/"+a[b].format===this.format)&&(!this._style||a[b].style===this._style)){s.mixin(this,{description:a[b].description,tileInfo:a[b].tileInfo,spatialReference:a[b].tileInfo.spatialReference,fullExtent:a[b].fullExtent,initialExtent:a[b].initialExtent,_identifier:a[b].identifier,_tileMatrixSetId:a[b].tileMatrixSet,format:"image/"+a[b].format,_style:a[b].style});break}this._setActiveLayer();
this.UrlTemplate=this._getTileUrlTemplate();this._levelToLevelValue=[];i.forEach(this.tileInfo.lods,function(a){this._levelToLevelValue[a.level]=a.levelValue?a.levelValue:a.level},this)},_getCapabilities:function(){var a;"KVP"===this.serviceMode?a=-1<this._url.indexOf("?")?this._url+"&request=GetCapabilities&service=WMTS&version="+this.version:this._url+"?request=GetCapabilities&service=WMTS&version="+this.version:"RESTful"===this.serviceMode&&(a=this._url+"/"+this.version+"/WMTSCapabilities.xml");
B({url:a,handleAs:"text",load:this._parseCapabilities,error:this._getCapabilitiesError})},_parseCapabilities:function(a){var a=a.replace(/ows:/gi,""),a=A.parse(a),b=h.query("Contents",a)[0];if(b){var e=h.query("OperationsMetadata",a)[0],c=h.query("[name='GetTile']",e)[0],e=this._url,c=h.query("Get",c),d;for(d=0;d<c.length;d++){var f=h.query("Constraint",c[d])[0];if(!f||this._getTagWithChildTagValue("AllowedValues","Value",this.serviceMode,f)){e=c[d].attributes[0].nodeValue;break}}-1===e.indexOf("/1.0.0/")&&
"RESTful"===this.serviceMode&&(e+="/");"KVP"===this.serviceMode&&(e+=-1<e.indexOf("?")?"":"?");this._url=e;this.copyright=this._getTagValues("Capabilities>ServiceIdentification>AccessConstraints",a)[0];var a=h.query("Layer",b),g,n=[];this.layers=[];i.forEach(a,function(a){g=this._getTagValues("Identifier",a)[0];n.push(g);this.layers.push(this._getWMTSLayerInfo(g,a,b))},this);this._setActiveLayer();this.loaded=!0;this.onLoad(this)}else console.error("The WMTS capabilities XML is not valid"),this.onError(Error("The WMTS capabilities XML is not valid"))},
_setActiveLayer:function(a){a||(a={});if(a.identifier)this._identifier=a.identifier;if(a.tileMatrixSet)this._tileMatrixSetId=a.tileMatrixSet;if(a.format)this.format=a.format;if(a.style)this._style=a.style;if(this.layers)if(this._identifier?a=i.filter(this.layers,function(a){return a.identifier===this._identifier},this)[0]:(a=this.layers[0],this._identifier=this.layers[0].identifier),a){if(this.format){if(-1===this.format.indexOf("image/"))this.format="image/"+this.format;if(-1===i.indexOf(a.formats,
this.format)){console.error("The layer doesn't support the format of "+this.format);this.onError(Error("The layer doesn't support the format of "+this.format));return}}else if(this.format=a.formats[0],-1===this.format.indexOf("image/"))this.format="image/"+this.format;if(this._style){if(-1===i.indexOf(a.styles,this._style)){console.error("The layer doesn't support the style of "+this._style);this.onError(Error("The layer doesn't support the style of "+this._style));return}}else this._style=a.styles[0];
var b;if(this._tileMatrixSetId){if(b=i.filter(a.tileMatrixSetInfos,function(a){return a.tileMatrixSet===this._tileMatrixSetId},this)[0],!b){console.error("The tileMatrixSetId "+this._tileMatrixSetId+" is not supported by the layer of "+this._identifier);this.onError(Error("The tileMatrixSetId "+this._tileMatrixSetId+" is not supported by the layer of "+this._identifier));return}}else(b=i.filter(a.tileMatrixSetInfos,function(a){return"GoogleMapsCompatible"===a.tileMatrixSet})[0])||(b=a.tileMatrixSetInfos[0]),
this._tileMatrixSetId=b.tileMatrixSet;this.description=a.description;this.title=a.title;this.spatialReference=b.tileInfo.spatialReference;this.tileInfo=b.tileInfo;this._levelToLevelValue=[];i.forEach(this.tileInfo.lods,function(a){this._levelToLevelValue[a.level]=a.levelValue?a.levelValue:a.level},this);102100===this.spatialReference.wkid||102113===this.spatialReference.wkid?this.fullExtent=this.initialExtent=C.geographicToWebMercator(a.gcsExtent):4326===this.spatialReference.wkid?this.fullExtent=
this.initialExtent=a.gcsExtent:(this.fullExtent=b.fullExtent,this.initialExtent=b.initialExtent);this.resourceUrls=a.resourceUrls;this.UrlTemplate=this._getTileUrlTemplate();this.layerInfo={identifier:this._identifier,tileMatrixSet:this._tileMatrixSetId,format:this.format,style:this._style,fullExtent:this.fullExtent,initialExtent:this.initialExtent,tileInfo:this.tileInfo,title:this.title,description:this.description}}else console.error("couldn't find the layer "+this._identifier),this.onError(Error("couldn't find the layer "+
this._identifier))},_getWMTSLayerInfo:function(a,b,e){var c=this._getTagValues("Abstract",b)[0],d=this._getTagValues("Title",b)[0],f=h.query("WGS84BoundingBox",b)[0],g=f?this._getTagValues("LowerCorner",f)[0].split(" "):["-180","-90"],n=f?this._getTagValues("UpperCorner",f)[0].split(" "):["180","90"],f=parseFloat(g[0]),g=parseFloat(g[1]),o=parseFloat(n[0]),n=parseFloat(n[1]),f=new y(f,g,o,n,new w({wkid:4326})),n=this._getTagValues("Identifier",h.query("Style",b)[0]),p=this._getTagValues("Identifier",
h.query("Dimension",b)[0]),q=this._getTagValues("Value",h.query("Dimension",b)[0])||this._getTagValues("Default",h.query("Dimension",b)[0]),g=this._getTagValues("Format",b),e=this._getLayerMatrixInfos(b,e),a={identifier:a,tileMatrixSetInfos:e,formats:g,styles:n,title:d,description:c,gcsExtent:f},b=h.query("ResourceURL",b),j=[],m;i.forEach(b,function(a){m=a.getAttribute("template");p&&q&&(m=m.replace("{"+p+"}",q));j.push({template:m,format:a.getAttribute("format"),resourceType:a.getAttribute("resourceType")})});
if(j&&0<j.length)a.resourceUrls=j;return a},_getLayerMatrixInfos:function(a,b){var e,c=[];if(!this._allMatrixInfos)this._allMatrixInfos=[];var d=this._getTagValues("TileMatrixSet",a);if(d&&0!==d.length)return i.forEach(d,function(d){var g;if(0<this._allMatrixInfos.length)for(e=0;e<this._allMatrixInfos.length;e++)if(this._allMatrixInfos[e].tileMatrixSet==d){g=this._allMatrixInfos[e];break}g||(g=this._getLayerMatrixInfo(d,a,b),this._allMatrixInfos.push(g));c.push(g)},this),c},_getLayerMatrixInfo:function(a,
b,e){var c,d,f,g,i=[],o=this._getTagValues("TileMatrix",this._getTagWithChildTagValue("TileMatrixSetLink","TileMatrixSet",a,b)),p=this._getTagWithChildTagValue("TileMatrixSet","Identifier",a,e);g=this._getTagValues("SupportedCRS",p)[0];c=g.split(":").pop();if(900913==c||3857==c)c=102100;if(-1<g.toLowerCase().indexOf("crs84")||-1<g.toLowerCase().indexOf("crs:84"))c=4326;else if(-1<g.toLowerCase().indexOf("crs83")||-1<g.toLowerCase().indexOf("crs:83"))c=4269;else if(-1<g.toLowerCase().indexOf("crs27")||
-1<g.toLowerCase().indexOf("crs:27"))c=4267;var q=new w({wkid:c}),j=h.query("TileMatrix",p)[0],e=parseInt(this._getTagValues("TileWidth",j)[0],10),b=parseInt(this._getTagValues("TileHeight",j)[0],10);d=this._getTagValues("TopLeftCorner",j)[0].split(" ");var m=d[0],r=d[1];1<m.split("E").length&&(d=m.split("E"),m=d[0]*Math.pow(10,d[1]));1<r.split("E").length&&(d=r.split("E"),r=d[0]*Math.pow(10,d[1]));for(d=0;d<this._flippingAxisForWkids.length;d++)if(g.split(":").pop()>=this._flippingAxisForWkids[d][0]&&
g.split(":").pop()<=this._flippingAxisForWkids[d][1]||4326===c){f=new x(parseFloat(r),parseFloat(m),q);break}d===this._flippingAxisForWkids.length&&(f=new x(parseFloat(m),parseFloat(r),q));if(0===o.length){o=h.query("TileMatrix",p);for(d=0;d<o.length;d++)g=this._getLodFromTileMatrix(o[d],c,d),i.push(g)}else for(d=0;d<o.length;d++)g=this._getLodFromTileMatrix(this._getTagWithChildTagValue("TileMatrix","Identifier",o[d],p),c,d),i.push(g);c=h.query("BoundingBox",p)[0];var k,l;c&&(k=this._getTagValues("LowerCorner",
c)[0].split(" "),l=this._getTagValues("UpperCorner",c)[0].split(" "));k&&1<k.length&&l&&1<l.length?(j=parseFloat(k[0]),c=parseFloat(k[1]),k=parseFloat(l[0]),l=parseFloat(l[1])):(k=this._getTagValues("MatrixWidth",j)[0],c=this._getTagValues("MatrixHeight",j)[0],j=f.x,l=f.y,k=j+k*b*i[0].resolution,c=l-c*e*i[0].resolution);l=k=new y(j,c,k,l,q);f=new E({dpi:90.71428571428571,spatialReference:q,format:this.format,rows:e,cols:b,origin:f,lods:i});return{tileMatrixSet:a,fullExtent:l,initialExtent:k,tileInfo:f}},
_getCapabilitiesError:function(a){console.error("Failed to get capabilities xml");this.onError(a)},_getLodFromTileMatrix:function(a,b,e){var c=this._getTagValues("Identifier",a)[0],a=this._getTagValues("ScaleDenominator",a)[0];1<a.split("E").length?(a=a.split("E"),a=a[0]*Math.pow(10,a[1])):a=parseFloat(a);b=t.isDefined(u[b])?u.values[u[b]]:111194.6519066546;return{level:e,levelValue:c,scale:a,resolution:7*a/25E3/b}},_getTag:function(a,b){var e=h.query(a,b);return e&&0<e.length?e[0]:null},_getTagValues:function(a,
b){var e=[],c=a.split(">"),d,f;d=h.query(c[0],b)[0];if(1<c.length){for(f=1;f<c.length-1;f++)d=h.query(c[f],d)[0];c=h.query(c[c.length-1],d)}else c=h.query(c[0],b);c&&0<c.length&&i.forEach(c,function(a){v("ie")?e.push(a.childNodes[0].nodeValue):e.push(a.textContent)});return e},_getAttributeValues:function(a,b,e){var a=h.query(a,e),c=[];a&&0<a.length&&i.forEach(a,function(a){c.push(a.getAttribute(b))});return c},_getTagWithChildTagValue:function(a,b,e,c){var c=c.childNodes,d,f;for(f=0;f<c.length;f++)if(-1<
c[f].nodeName.indexOf(a)){if(v("ie")){if(t.isDefined(h.query(b,c[f])[0]))d=h.query(b,c[f])[0].childNodes[0].nodeValue}else if(t.isDefined(h.query(b,c[f])[0]))d=h.query(b,c[f])[0].textContent;if(d===e)return c[f]}},_flippingAxisForWkids:[[3819,3819],[3821,3824],[3889,3889],[3906,3906],[4001,4025],[4027,4036],[4039,4047],[4052,4055],[4074,4075],[4080,4081],[4120,4176],[4178,4185],[4188,4216],[4218,4289],[4291,4304],[4306,4319],[4322,4326],[4463,4463],[4470,4470],[4475,4475],[4483,4483],[4490,4490],
[4555,4558],[4600,4646],[4657,4765],[4801,4811],[4813,4821],[4823,4824],[4901,4904],[5013,5013],[5132,5132],[5228,5229],[5233,5233],[5246,5246],[5252,5252],[5264,5264],[5324,5340],[5354,5354],[5360,5360],[5365,5365],[5370,5373],[5381,5381],[5393,5393],[5451,5451],[5464,5464],[5467,5467],[5489,5489],[5524,5524],[5527,5527],[5546,5546],[2044,2045],[2081,2083],[2085,2086],[2093,2093],[2096,2098],[2105,2132],[2169,2170],[2176,2180],[2193,2193],[2200,2200],[2206,2212],[2319,2319],[2320,2462],[2523,2549],
[2551,2735],[2738,2758],[2935,2941],[2953,2953],[3006,3030],[3034,3035],[3038,3051],[3058,3059],[3068,3068],[3114,3118],[3126,3138],[3150,3151],[3300,3301],[3328,3335],[3346,3346],[3350,3352],[3366,3366],[3389,3390],[3416,3417],[3833,3841],[3844,3850],[3854,3854],[3873,3885],[3907,3910],[4026,4026],[4037,4038],[4417,4417],[4434,4434],[4491,4554],[4839,4839],[5048,5048],[5105,5130],[5253,5259],[5269,5275],[5343,5349],[5479,5482],[5518,5519],[5520,5520],[20004,20032],[20064,20092],[21413,21423],[21473,
21483],[21896,21899],[22171,22177],[22181,22187],[22191,22197],[25884,25884],[27205,27232],[27391,27398],[27492,27492],[28402,28432],[28462,28492],[30161,30179],[30800,30800],[31251,31259],[31275,31279],[31281,31290],[31466,31700],[900913,900913]]})});