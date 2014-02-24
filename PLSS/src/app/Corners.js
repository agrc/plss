define([
    'dojo/text!app/templates/Corners.html',

    'dojo/_base/declare',
    'dojo/_base/Color',
    'dojo/_base/lang',

    'dojo/dom-attr',

    'dojo/topic',
    'dojo/on',

    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',

    'esri/SpatialReference',
    'esri/graphic',
    'esri/tasks/query',
    'esri/tasks/QueryTask',
    'esri/geometry/Extent',
    'esri/symbols/SimpleMarkerSymbol'

], function(
    template,

    declare,
    Color,
    lang,

    domAttr,

    topic,
    on,

    _WidgetBase,
    _TemplatedMixin,

    SpatialReference,
    Graphic,
    Query,
    QueryTask,
    Extent,
    SimpleMarkerSymbol
) {
    return declare([_WidgetBase, _TemplatedMixin], {
        templateString: template,
        baseClass: 'corners',

        _graphic: null,

        // instantiation variables

        // map - agrc.widgets.map
        map: null,
        
        // linkTemplate - string 
        //      the template of the link with lang.replace {id} substitutions for the corner value
        linkTemplate: null,

        postCreate: function() {
            // summary:
            //      after creation
            //
            console.log('app.Corners::postCreate', arguments);

            this.queryTask = new QueryTask(AGRC.urls.points + '/4');
            this.queryParams = new Query();
            this.queryParams.outFields = ['POINTID'];
            this.queryParams.returnGeometry = true;

            this.setupConnections();
        },
        setupConnections: function () {
            // summary:
            //      after creation
            //
            console.log('app.Corners::setupConnections', arguments);

            on(this.corner, 'input', lang.hitch(this, '_updateLinkLocation'));
            on(this.corner, 'keyup', lang.hitch(this, '_updateLinkLocation'));
        },
        zoom: function() {
            // summary:
            //      handles the on click event of the button
            console.log('app.Corners::zoom', arguments);
            var id = this.corner.value;

            if (!id) {
                return;
            }

            domAttr.set(this.zoomButton, 'disabled', true);
            this.map.showLoader();

            this._zoom(id);
        },
        _zoom: function(cornerId) {
            // summary:
            //      description
            // cornerId
            console.log('app.Corners::_zoom', arguments);

            this.queryParams.searchText = cornerId;
            this.queryParams.where = "POINTID='" + cornerId + "'";

            if (this.inflight) {
                return;
            }

            this.inflight = this.queryTask.execute(this.queryParams, lang.hitch(this, '_success'));
        },
        _success: function(featureSet) {
            // summary:
            //      success callback from query task
            // featureSet
            console.log('app.Corners::_success', arguments);

            this.inflight = null;
            domAttr.remove(this.zoomButton, 'disabled');
            this.map.hideLoader();

            if (this._graphic) {
                this.map.graphics.remove(this._graphic);
            }

            var corner = featureSet.features[0].geometry,
                symbol = new SimpleMarkerSymbol(),
                buffer = 1000,
                xMin = corner.x - buffer,
                yMin = corner.y - buffer,
                xMax = corner.x + buffer,
                yMax = corner.y + buffer;

            this._graphic = new Graphic(corner, symbol);

            this.map.setExtent(new Extent(xMin, yMin, xMax, yMax, new SpatialReference(26912)), true);
            this.map.graphics.add(this._graphic);
        },
        _updateLinkLocation: function() {
            // summary:
            //      opens a new window for the url
            // url
            console.log('app.Corners::_updateLinkLocation', arguments);

            var value = this.corner.value;
            
            if (!value) {
                domAttr.remove(this.showLink, 'href');
                return;
            }
            
            domAttr.set(this.showLink, 'href', lang.replace(this.linkTemplate, { id: value }));
        }
    });
});