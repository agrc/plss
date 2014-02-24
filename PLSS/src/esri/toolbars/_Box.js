//>>built
define(["dojo/_base/declare","dojo/_base/lang","dojo/_base/array","dojo/_base/connect","dojo/has","dojo/dom-style","dojox/gfx/Moveable","dojox/gfx/matrix","esri/kernel","esri/lang","esri/geometry/Point","esri/geometry/Polyline","esri/geometry/webMercatorUtils","esri/geometry/jsonUtils","esri/graphic"],function(p,i,h,l,v,q,r,j,w,s,m,t,n,u,o){return p(null,{declaredClass:"esri.toolbars._Box",constructor:function(b,e,c,a,d,g){this._graphic=b;this._map=e;this._toolbar=c;this._scale=a;this._rotate=d;this._defaultEventArgs=
{};this._scaleEvent="Scale";this._rotateEvent="Rotate";this._uniformScaling=g;b=c._options;this._markerSymbol=b.boxHandleSymbol;this._lineSymbol=b.boxLineSymbol;this._moveStartHandler=i.hitch(this,this._moveStartHandler);this._firstMoveHandler=i.hitch(this,this._firstMoveHandler);this._moveStopHandler=i.hitch(this,this._moveStopHandler);this._moveHandler=i.hitch(this,this._moveHandler);this._init()},destroy:function(){this._cleanUp();this._graphic=this._map=this._toolbar=this._markerSymbol=this._lineSymbol=
null},refresh:function(){this._draw()},suspend:function(){h.forEach(this._getAllGraphics(),function(b){b.hide()})},resume:function(){h.forEach(this._getAllGraphics(),function(b){b.show()});this._draw()},_init:function(){this._draw()},_cleanUp:function(){this._connects&&h.forEach(this._connects,l.disconnect);var b=this._toolbar._scratchGL;this._anchors&&h.forEach(this._anchors,function(e){b.remove(e.graphic);(e=e.moveable)&&e.destroy()});this._box&&b.remove(this._box);this._box=this._anchors=this._connects=
null},_draw:function(){if(this._graphic.getDojoShape()){var b=this._map,e=this._toolbar._scratchGL,c=this._getBoxCoords(),a=new t(b.spatialReference),d=i.clone(h.filter(c,function(b,c){return 8!==c&&0===c%2}));d[0]&&d.push([d[0][0],d[0][1]]);a.addPath(d);this._rotate&&a.addPath([c[1],c[8]]);this._box?this._box.setGeometry(a):(this._box=new o(a,this._lineSymbol),e.add(this._box));this._anchors?h.forEach(this._anchors,function(a,e){this._scale||(e=8);var d=new m(c[e],b.spatialReference);a.graphic.setGeometry(d);
var d=a.moveable,k=a.graphic.getDojoShape();if(k)if(d){if(k!==d.shape)d.destroy(),a.moveable=this._getMoveable(a.graphic,e)}else a.moveable=this._getMoveable(a.graphic,e)},this):(this._anchors=[],this._connects=[],h.forEach(c,function(a,c){if(this._scale||!(8>c)){var a=new m(a,b.spatialReference),d=new o(a,this._markerSymbol);e.add(d);this._anchors.push({graphic:d,moveable:this._getMoveable(d,c)})}},this))}else this._cleanUp()},_getBoxCoords:function(b){var e=this._map,c=this._getTransformedBoundingBox(this._graphic),
a=[],d,g,f;h.forEach(c,function(c,k,h){d=c;(g=h[k+1])||(g=h[0]);f={x:(d.x+g.x)/2,y:(d.y+g.y)/2};b||(d=e.toMap(d),f=e.toMap(f));a.push([d.x,d.y]);a.push([f.x,f.y])});this._rotate&&(c=i.clone(a[1]),c=b?{x:c[0],y:c[1]}:e.toScreen({x:c[0],y:c[1],spatialReference:e.spatialReference}),c.y-=this._toolbar._options.rotateHandleOffset,b||(c=e.toMap(c)),a.push([c.x,c.y]));return a},_getTransformedBoundingBox:function(b){var e=this._map,c=b.geometry.getExtent(),a=b.geometry.spatialReference,b=new m(c.xmin,c.ymax,
a),c=new m(c.xmax,c.ymin,a),b=e.toScreen(b),c=e.toScreen(c);return[{x:b.x,y:b.y},{x:c.x,y:b.y},{x:c.x,y:c.y},{x:b.x,y:c.y}]},_getAllGraphics:function(){var b=[this._box];this._anchors&&h.forEach(this._anchors,function(e){b.push(e.graphic)});return b=h.filter(b,s.isDefined)},_getMoveable:function(b,e){var c=b.getDojoShape();if(c){var a=new r(c);a._index=e;this._connects.push(l.connect(a,"onMoveStart",this._moveStartHandler));this._connects.push(l.connect(a,"onFirstMove",this._firstMoveHandler));this._connects.push(l.connect(a,
"onMoveStop",this._moveStopHandler));a.onMove=this._moveHandler;(c=c.getEventSource())&&q.set(c,"cursor",this._toolbar._cursors["box"+e]);return a}},_moveStartHandler:function(b){this._toolbar["on"+(8===b.host._index?this._rotateEvent:this._scaleEvent)+"Start"](this._graphic)},_firstMoveHandler:function(b){var e=b.host._index,c=this._wrapOffset=b.host.shape._wrapOffsets[0]||0,a=this._graphic.getLayer()._div.getTransform(),d,b=h.map(this._getBoxCoords(!0),function(a){return{x:a[0]+c,y:a[1]}});d={x:b[1].x,
y:b[3].y};this._centerCoord=j.multiplyPoint(j.invert(a),d);if(8===e)d=j.multiplyPoint(j.invert(a),b[1]),this._startLine=[this._centerCoord,d],this._moveLine=i.clone(this._startLine);else if(d=j.multiplyPoint(j.invert(a),b[e]),a=j.multiplyPoint(j.invert(a),b[(e+4)%8]),this._firstMoverToCenter=Math.sqrt((d.x-this._centerCoord.x)*(d.x-this._centerCoord.x)+(d.y-this._centerCoord.y)*(d.y-this._centerCoord.y)),this._startBox=a,this._startBox.width=b[4].x-b[0].x,this._startBox.height=b[4].y-b[0].y,this._moveBox=
i.clone(this._startBox),this._xfactor=d.x>a.x?1:-1,this._yfactor=d.y>a.y?1:-1,1===e||5===e)this._xfactor=0;else if(3===e||7===e)this._yfactor=0;this._toolbar._beginOperation("BOX");this._toolbar["on"+(8===e?this._rotateEvent:this._scaleEvent)+"FirstMove"](this._graphic)},_moveHandler:function(b,e){var c=b.host._index,a=this._defaultEventArgs,d,g,f,h,k=0,i=0;a.angle=0;a.scaleX=1;a.scaleY=1;if(8===c)d=this._startLine,g=this._moveLine,f=g[1],f.x+=e.dx,f.y+=e.dy,f=this._getAngle(d,g),g=j.rotategAt(f,
d[0]),this._graphic.getDojoShape().setTransform(g),a.transform=g,a.angle=f,a.around=d[0];else{d=this._startBox;g=this._moveBox;g.width+=e.dx*this._xfactor;g.height+=e.dy*this._yfactor;this._uniformScaling?(f=g.x+this._xfactor*g.width,g=g.y+this._yfactor*g.height,g=Math.sqrt((f-this._centerCoord.x)*(f-this._centerCoord.x)+(g-this._centerCoord.y)*(g-this._centerCoord.y)),f=h=g/this._firstMoverToCenter,k=this._xfactor*d.width/2,i=this._yfactor*d.height/2):(f=g.width/d.width,h=g.height/d.height);if(isNaN(f)||
Infinity===f||-Infinity===f)f=1;if(isNaN(h)||Infinity===h||-Infinity===h)h=1;g=j.scaleAt(f,h,d.x+k,d.y+i);this._graphic.getDojoShape().setTransform(g);a.transform=g;a.scaleX=f;a.scaleY=h;a.around={x:d.x+k,y:d.y+i}}this._toolbar["on"+(8===c?this._rotateEvent:this._scaleEvent)](this._graphic,a)},_moveStopHandler:function(b){var e=this._graphic,c=this._toolbar,a=c._geo?n.geographicToWebMercator(e.geometry):e.geometry,d=a.spatialReference,g=e.getDojoShape(),f=g.getTransform(),h=e.getLayer()._div.getTransform(),
a=a.toJson();this._updateSegments(a.paths||a.rings,f,h,d);g.setTransform(null);a=u.fromJson(a);e.setGeometry(c._geo?n.webMercatorToGeographic(a,!0):a);this._draw();this._startLine=this._moveLine=this._startBox=this._moveBox=this._xfactor=this._yfactor=null;c._endOperation("BOX");this._defaultEventArgs.transform=f;c["on"+(8===b.host._index?this._rotateEvent:this._scaleEvent)+"Stop"](this._graphic,this._defaultEventArgs)},_updateSegments:function(b,e,c,a){var d=this._map,g=this._wrapOffset||0;h.forEach(b,
function(b){h.forEach(b,function(b){var f=d.toScreen({x:b[0],y:b[1],spatialReference:a},!0);f.x+=g;f=j.multiplyPoint([c,e,j.invert(c)],f);f.x-=g;f=d.toMap(f);b[0]=f.x;b[1]=f.y})})},_getAngle:function(b,e){var c=180*Math.atan2(b[0].y-b[1].y,b[0].x-b[1].x)/Math.PI;return 180*Math.atan2(e[0].y-e[1].y,e[0].x-e[1].x)/Math.PI-c}})});