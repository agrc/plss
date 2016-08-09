define([
    'app/config',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/dom-attr',
    'dojo/on',
    'dojo/text!app/templates/Corners.html',
    'dojo/_base/declare',
    'dojo/_base/lang',

    'esri/geometry/Extent',
    'esri/graphic',
    'esri/SpatialReference',
    'esri/symbols/SimpleMarkerSymbol',
    'esri/tasks/query',
    'esri/tasks/QueryTask'
], function (
    config,

    _TemplatedMixin,
    _WidgetBase,

    domAttr,
    on,
    template,
    declare,
    lang,

    Extent,
    Graphic,
    SpatialReference,
    SimpleMarkerSymbol,
    Query,
    QueryTask
) {
    return declare([_WidgetBase, _TemplatedMixin], {

        templateString: template,

        baseClass: 'corners',

        _graphic: null,

        // instantiation variables

        // map - agrc.widgets.map
        map: null,

        // linkTemplate - string
        //      the template of the link with lang.replace {id}
        //       substitutions for the corner value
        linkTemplate: null,

        postCreate: function () {
            // summary:
            //      after creation
            //
            console.log('app.Corners::postCreate', arguments);

            this.queryTask = new QueryTask(config.urls.points + '/4');
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
        zoom: function () {
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
        _zoom: function (cornerId) {
            // summary:
            //      description
            // cornerId
            console.log('app.Corners::_zoom', arguments);

            this.queryParams.searchText = cornerId;
            this.queryParams.where = 'POINTID=\'' + cornerId + '\'';

            if (this.inflight) {
                return;
            }

            this.inflight = this.queryTask.execute(this.queryParams,
                lang.hitch(this, '_success'));
        },
        _success: function (featureSet) {
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

            var corner = featureSet.features[0].geometry;
            var symbol = new SimpleMarkerSymbol();
            var buffer = 1000;
            var xMin = corner.x - buffer;
            var yMin = corner.y - buffer;
            var xMax = corner.x + buffer;
            var yMax = corner.y + buffer;

            this._graphic = new Graphic(corner, symbol);

            this.map.setExtent(new Extent(xMin, yMin, xMax, yMax, new SpatialReference(26912)), true);
            this.map.graphics.add(this._graphic);
        },
        _updateLinkLocation: function () {
            // summary:
            //      opens a new window for the url
            // url
            console.log('app.Corners::_updateLinkLocation', arguments);

            var value = this.corner.value;

            if (!value) {
                domAttr.remove(this.showLink, 'href');
                return;
            }

            domAttr.set(this.showLink, 'href', lang.replace(this.linkTemplate, {
                id: value
            }));
        }
    });
});
