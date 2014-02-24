//>>built
define(["dojo/_base/declare","dojo/_base/lang","dojo/_base/array","dojo/has","dojo/sniff","dojo/dom-style","dijit/_Widget","dijit/_Templated","dojox/gfx","esri/symbols/jsonUtils","esri/kernel"],function(i,j,m,n,s,k,o,p,q,r){return i([o,p],{declaredClass:"esri.dijit.editing.TemplatePickerItem",templateString:"<div class='item' style='text-align: center;'><div class='itemSymbol' dojoAttachPoint='_surfaceNode'></div><div class='itemLabel'>${label}</div></div>",startup:function(){if(!this._started)this.inherited(arguments),
this._surface=this._draw(this._surfaceNode,this.symbol,this.surfaceWidth,this.surfaceHeight,this.template)},_draw:function(a,c,b,g,e){if(c){a=q.createSurface(a,b,g);if(9>n("ie")){var d=a.getEventSource();k.set(d,"position","relative");k.set(d.parentNode,"position","relative")}var c=!this.legendOverride&&this._getDrawingToolShape(c,e)||r.getShapeDescriptors(c),h;try{h=a.createShape(c.defaultShape).setFill(c.fill).setStroke(c.stroke)}catch(i){a.clear();a.destroy();return}var f=h.getBoundingBox(),c=
f.width,e=f.height,d=-(f.x+c/2),f=-(f.y+e/2),l=a.getDimensions(),d={dx:d+l.width/2,dy:f+l.height/2};if(c>b||e>g)b=((b<g?b:g)-5)/(c>e?c:e),j.mixin(d,{xx:b,yy:b});h.applyTransform(d);return a}},_getDrawingToolShape:function(a,c){var b;switch(c?c.drawingTool||null:null){case "esriFeatureEditToolArrow":b={type:"path",path:"M 10,1 L 3,8 L 3,5 L -15,5 L -15,-2 L 3,-2 L 3,-5 L 10,1 E"};break;case "esriFeatureEditToolLeftArrow":b={type:"path",path:"M -15,1 L -8,8 L -8,5 L 10,5 L 10,-2 L -8,-2 L -8,-5 L -15,1 E"};
break;case "esriFeatureEditToolRightArrow":b={type:"path",path:"M 10,1 L 3,8 L 3,5 L -15,5 L -15,-2 L 3,-2 L 3,-5 L 10,1 E"};break;case "esriFeatureEditToolUpArrow":b={type:"path",path:"M 1,-10 L 8,-3 L 5,-3 L 5,15 L -2,15 L -2,-3 L -5,-3 L 1,-10 E"};break;case "esriFeatureEditToolDownArrow":b={type:"path",path:"M 1,15 L 8,8 L 5,8 L 5,-10 L -2,-10 L -2,8 L -5,8 L 1,15 E"};break;case "esriFeatureEditToolTriangle":b={type:"path",path:"M -10,14 L 2,-10 L 14,14 L -10,14 E"};break;case "esriFeatureEditToolRectangle":b=
{type:"path",path:"M -10,-10 L 10,-10 L 10,10 L -10,10 L -10,-10 E"};break;case "esriFeatureEditToolCircle":b={type:"circle",cx:0,cy:0,r:10};break;case "esriFeatureEditToolEllipse":b={type:"ellipse",cx:0,cy:0,rx:10,ry:5};break;case "esriFeatureEditToolFreehand":b="simplelinesymbol"===a.type||"cartographiclinesymbol"===a.type?{type:"path",path:"m -11, -7c-1.5,-3.75 7.25,-9.25 12.5,-7c5.25,2.25 6.75,9.75 3.75,12.75c-3,3 -3.25,2.5 -9.75,5.25c-6.5,2.75 -7.25,14.25 2,15.25c9.25,1 11.75,-4 13.25,-6.75c1.5,-2.75 3.5,-11.75 12,-6.5"}:
{type:"path",path:"M 10,-13 c3.1,0.16667 4.42564,2.09743 2.76923,3.69231c-2.61025,2.87179 -5.61025,5.6718 -6.14358,6.20513c-0.66667,0.93333 -0.46667,1.2 -0.53333,1.93333c-0.00001,0.86666 0.6,1.66667 1.13334,2c1.03077,0.38462 2.8,0.93333 3.38974,1.70769c0.47693,0.42564 0.87693,0.75897 1.41026,1.75897c0.13333,1.06667 -0.46667,2.86667 -1.8,3.8c-0.73333,0.73333 -3.86667,2.66666 -4.86667,3.13333c-0.93333,0.8 -7.4,3.2 -7.6,3.06667c-1.06667,0.46667 -4.73333,1.13334 -5.2,1.26667c-1.6,0.33334 -4.6,0.4 -6.25128,0.05128c-1.41539,-0.18462 -2.34872,-2.31796 -1.41539,-4.45129c0.93333,-1.73333 1.86667,-3.13333 2.64615,-3.85641c1.28718,-1.47692 2.57437,-2.68204 3.88718,-3.54359c0.88718,-1.13845 1.8,-1.33333 2.26666,-2.45641c0.33334,-0.74359 0.37949,-1.7641 0.06667,-2.87692c-0.66666,-1.46666 -1.66666,-1.86666 -2.98975,-2.2c-1.27692,-0.26666 -2.12307,-0.64102 -3.27692,-1.46666c-0.66667,-1.00001 -1.01538,-3.01539 0.73333,-4.06667c1.73333,-1.2 3.6,-1.93333 4.93333,-2.2c1.33333,-0.46667 4.84104,-1.09743 5.84103,-1.23076c1.60001,-0.46667 6.02564,-0.50257 7.29231,-0.56924z"};
break;default:return null}return{defaultShape:b,fill:a.getFill(),stroke:a.getStroke()}},_repaint:function(a){a?(a.getStroke&&a.setStroke&&a.setStroke(a.getStroke()),a.getFill&&a.setFill&&a.setFill(a.getFill()),a.children&&j.isArray(a.children)&&m.forEach(a.children,this._repaint,this)):this._surface=this._draw(this._surfaceNode,this.symbol,this.surfaceWidth,this.surfaceHeight,this.template)},destroy:function(){this._surface&&(this._surface.destroy(),delete this._surface);this.inherited(arguments)}})});