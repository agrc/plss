define([
    'dojo/text!app/templates/CornerInformation.html',
    'dojo/text!app/templates/IdentifyTemplate.html',

    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/_base/fx',

    'dojo/dom-style',
    'dojo/dom-class',
    'dojo/dom-attr',
    'dojo/dom-construct',
    'dojo/dom',

    'dojo/on',
    'dojo/topic',
    'dojo/aspect',

    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',

    'esri/graphic',
    'esri/symbols/SimpleMarkerSymbol',

    'mustache/mustache',

    'app/data/existingPlssWebsitesByCounty',
    'app/config',


    'dojo/NodeList-dom'
], function(
    template,
    identifyTemplateText,

    declare,
    lang,
    array,
    fx,

    domStyle,
    domClass,
    domAttr,
    domConstruct,
    dom,

    on,
    topic,
    aspect,

    _WidgetBase,
    _TemplatedMixin,

    Graphic,
    SimpleMarkerSymbol,

    mustache,

    plssWebSites,
    config
) {
    return declare([_WidgetBase, _TemplatedMixin], {

        templateString: template,

        token: null,

        // required ctor variables
        app: null,

        postCreate: function() {
            // summary:
            //      does some things when the widget has loaded
            console.log('app.CornerInformation::postCreate', arguments);

            if (!this.app) {
                throw 'must define app when creating app.CornerInformation';
            }

            this.setupConnections();
        },
        setupConnections: function() {
            // summary:
            //      setup events and subscriptions
            //
            console.log('app.CornerInformation::setupConnections', arguments);

            var defaultState = this;
            this.own(
                on(this.app, 'identify-success', function(args){
                    defaultState.multipleResults = null;
                    defaultState.showTemplate(args);
                })
            );

            topic.subscribe('app.authorize', lang.hitch(this, function(args) {
                console.log('app.CornerInformation::app.authorize', args);
                if (args && args.token) {
                    this.token = args.token;
                    domClass.replace(this.authorizedContent, 'show', 'hide');

                    return;
                }

                this.token = null;
                domClass.replace(this.authorizedContent, 'hide', 'show');
            }));

            aspect.after(this, 'showTemplate', lang.hitch(this, function() {
                domClass.remove(this.domNode.parentNode, 'closed');
            }));
        },
        showTemplate: function(templateData, changeToId) {
            // summary:
            //      pushes the data through mustache and into the dom
            //      after an identify emits the identify-success event
            // templateData - Event: emitted event with results array form identify
            // changeToid - string: blmid to change template to
            console.log('app.CornerInformation::showTemplate', arguments);

            var feature = null,
                model = {};

            if (templateData && templateData.results.length === 0) {
                this.content.innerHTML = mustache.render(identifyTemplateText, model);

                return;
            }

            if (templateData && templateData.results.length > 1) {
                this.hydrateListsFromMultipleResults(templateData.results);
            }

            if (changeToId && this.multipleResults) {
                feature = this.multipleResults[changeToId];
            } else {
                feature = templateData.results[0].feature;
            }

            feature.attributes.options = this.options;
            feature.attributes.tiesheet = this.showTiesheetMessage;

            model = {
                item: feature.attributes
            };

            this.content.innerHTML = mustache.render(identifyTemplateText, model);

            this.highlightPoint(feature.geometry);

            this.displayAuthorizedContent(feature.attributes['Corner Point Identifier']);
            this.setupMultipleConnection();
        },
        showTiesheetMessage: function() {
            // summary:
            //      mustache templating function
            //
            console.log('app.CornerInformation::showTiesheetMessage', arguments);

            return function(text, render) {
                var county = render(text);

                if (!county || county === 'Null') {
                    return '<span class="glyphicon glyphicon-warning-sign"></span>  Not available.';
                }

                var url = plssWebSites[county];

                if (url) {
                    return mustache.render('<span class="glyphicon glyphicon-share"></span>' +
                        ' <a href="{{& url}}" target="_blank">County Managed.</a>', {
                            url: url
                        });
                }

                return mustache.render('<span class="glyphicon glyphicon-picture"></span>' +
                    ' <a href="{{& url}}{{& pdf}}" target="_blank">View tie sheet.</a>', {
                        url: config.urls.tieSheets,
                        pdf: render(text)
                    });
            };
        },
        changeTemplate: function(evt) {
            // summary:
            //      handles the change event of the multiple select node
            // evt
            console.log('app.CornerInformation::changeTemplate', arguments);

            var node = this.domNode;
            fx.fadeOut({
                node: this.domNode,
                onEnd: function() {
                    fx.fadeIn({
                        node: node
                    }).play();
                }
            }).play();

            var value = evt.target.value;

            return this.showTemplate(null, value);
        },
        hydrateListsFromMultipleResults: function(results) {
            // summary:
            //      hydrates an array of blmid's for a select
            //      and an associative array of blmids to the features
            // results
            console.log('app.CornerInformation::hydrateListsFromMultipleResults', arguments);

            if (results.length > 1) {
                this.multipleResults = {};

                this.options = [];
                array.forEach(results, function(item) {
                    var id = item.feature.attributes['Corner Point Identifier'];

                    this.options.push(id);
                    this.multipleResults[id] = item.feature;
                }, this);
            } else {
                this.multipleResults = null;
            }
        },
        setupMultipleConnection: function() {
            // summary:
            //      setup
            //
            console.log('app.CornerInormation::setupMultipleConnection', arguments);

            if (this.multipleResults) {
                this.changeEvent = on(dom.byId('blmIdNumbers'), 'change', lang.hitch(this, 'changeTemplate'));
            } else {
                domConstruct.destroy('moreThanOneRow');
            }
        },
        displayAuthorizedContent: function(blmId) {
            // summary:
            //      shows buttons or hides them
            //      and shows
            console.log('app.CornerInformation::displayAuthorizedContent', arguments);

            if (!this.token) {
                domClass.replace(this.authorizedContent, 'hide', 'show');
            } else {
                domClass.replace(this.authorizedContent, 'show', 'hide');
            }

            domAttr.set(this.existingSubmit, 'href', config.urls.existing + '?blmid=' + blmId);
            domAttr.set(this.newSubmit, 'href', config.urls.tiesheet + '?blmid=' + blmId);
        },
        highlightPoint: function(geometry) {
            // summary:
            //      zooms the map and highlights the point
            // geometry
            console.log('app.CornerInformation::highlightPoint', arguments);

            this.app.map.zoomToGeometry(geometry);

            if (this._graphic) {
                this.app.map.graphics.remove(this._graphic);
            }

            var corner = geometry,
                symbol = new SimpleMarkerSymbol();

            this._graphic = new Graphic(corner, symbol);

            this.app.map.graphics.add(this._graphic);
        },
        close: function() {
            console.log('app.CornerInformation::close', arguments);

            domClass.add(this.domNode.parentNode, 'closed');

            if (this._graphic) {
                this.app.map.graphics.remove(this._graphic);
            }
        }
    });
});
