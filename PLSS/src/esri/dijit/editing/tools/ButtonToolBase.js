//>>built
define(["dojo/_base/declare","dojo/_base/lang","dojo/has","dijit/form/Button","esri/dijit/editing/tools/ToolBase","esri/kernel"],function(c,d,e,a,b){return c([a,b],{declaredClass:"esri.dijit.editing.tools.ButtonToolBase",postCreate:function(){this.inherited(arguments);this._setShowLabelAttr&&this._setShowLabelAttr(!1)},destroy:function(){a.prototype.destroy.apply(this,arguments);b.prototype.destroy.apply(this,arguments)}})});