//>>built
define(["dojo/_base/declare","dojo/_base/lang","dojo/_base/array","dojo/has","esri/kernel","esri/symbols/Symbol","esri/tasks/ColorRamp"],function(b,e,c,f,g,d){return b(d,{declaredClass:"esri.tasks.MultipartColorRamp",type:"multipart",constructor:function(){this.colorRamps=[]},addColorRamp:function(a){this.colorRamps.push(a)},toJson:function(){return{type:"multipart",colorRamps:c.map(this.colorRamps,function(a){return a.toJson()})}}})});