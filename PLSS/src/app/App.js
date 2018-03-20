/* global $ */
define([
    'agrc/widgets/locate/MagicZoom',
    'agrc/widgets/locate/TRSsearch',
    'agrc/widgets/locate/ZoomToCoords',
    'agrc/widgets/map/BaseMap',

    'app/AuthStatus',
    'app/config',
    'app/CornerInformation',
    'app/Corners',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',
    'dijit/_WidgetsInTemplateMixin',

    'dojo/dom',
    'dojo/dom-attr',
    'dojo/dom-class',
    'dojo/on',
    'dojo/query',
    'dojo/request',
    'dojo/text!app/templates/App.html',
    'dojo/topic',
    'dojo/_base/array',
    'dojo/_base/declare',
    'dojo/_base/event',
    'dojo/_base/lang',

    'esri/graphic',
    'esri/layers/ArcGISDynamicMapServiceLayer',
    'esri/layers/VectorTileLayer',
    'esri/symbols/PictureMarkerSymbol',
    'esri/tasks/IdentifyParameters',
    'esri/tasks/IdentifyTask',
    'esri/tasks/ImageServiceIdentifyResult',

    'ijit/widgets/layout/SideBarToggler',

    'layer-selector',

    'bootstrap',
    'dojo/NodeList-html'
], function (
    MagicZoom,
    TrsSearch,
    ZoomToCoords,
    BaseMap,

    AuthStatus,
    config,
    CornerInformation,
    CornerZoom,

    _TemplatedMixin,
    _WidgetBase,
    _WidgetsInTemplateMixin,

    dom,
    domAttr,
    domClass,
    on,
    query,
    xhr,
    template,
    topic,
    array,
    declare,
    events,
    lang,

    Graphic,
    DynamicLayer,
    VectorTileLayer,
    PictureMarkerSymbol,
    IdentifyParameters,
    IdentifyTask,
    ImageServiceIdentifyResult,

    SideBarToggler,

    BaseMapSelector
) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        // summary:
        //      The main widget for the app

        widgetsInTemplate: true,

        templateString: template,

        baseClass: 'app',

        // map: agrc.widgets.map.Basemap
        map: null,

        constructor: function () {
            // summary:
            //      first function to fire after page loads
            console.info('app.App::constructor', arguments);

            //AGRC.app = this;

            this.inherited(arguments);
        },
        postCreate: function () {
            // summary:
            //      Executes while dom is detached
            console.log('app.App::postCreate', arguments);

            this.setupConnections();
            this.getUrls();

            this._childWidgets = [];

            this.map = new BaseMap(this.mapDiv, {
                useDefaultBaseMap: false
            });

            this._childWidgets.push(new BaseMapSelector({
                map: this.map,
                quadWord: config.quadWord,
                baseLayers: ['Topo', 'Hybrid', 'Lite', 'Terrain', 'Color IR']
            }));

            this._childWidgets.push(new TrsSearch({
                map: this.map,
                apiKey: config.apiKey,
                wkid: 3857
            }, this.trsNode));

            this._childWidgets.push(new MagicZoom({
                map: this.map,
                wkid: 3857,
                apiKey: config.apiKey,
                searchField: 'Name',
                placeHolder: 'place name...',
                maxResultsToDisplay: 10,
                'class': 'first'
            }, this.placesNode));

            this._childWidgets.push(new ZoomToCoords({
                map: this.map
            }, this.coordNode));

            this._childWidgets.push(new CornerZoom({
                map: this.map,
                linkTemplate: config.urls.tieSheets + '{id}.pdf'
            }, this.cornerNode));

            this._childWidgets.push(new AuthStatus({},
                this.authStatusNode));

            this._childWidgets.push(new CornerInformation({
                app: this
            }, this.toasterNode));

            this.initMap();
            this.initIdentify();

            this.inherited(arguments);
        },
        setupConnections: function () {
            // summary:
            //      sets up events, topics, etc
            // evt
            console.log('app.App::setupConnections', arguments);

            on(this.registerForm, 'input:change', lang.hitch(this, 'updateValidation'));
            on(this.loginForm, 'input:change', lang.hitch(this, 'updateValidation'));
            this.subscribe('app.logout', lang.hitch(this, 'logout'));
        },
        startup: function () {
            // summary:
            //      Fires after postCreate when all of the child widgets are finished laying out.
            console.log('app.App::startup', arguments);

            // call this before creating the map to make sure that the map container is
            // the correct size
            this.inherited(arguments);

            this.authorize();

            array.forEach(this._childWidgets, function (w) {
                w.startup();
            });
        },
        initMap: function () {
            // summary:
            //      Sets up the map
            console.info('app.App::initMap', arguments);

            this.plssLayer = new VectorTileLayer(config.urls.plss, {
                minScale: 600000
            });
            this.map.addLayer(this.plssLayer);
            this.map.addLoaderToLayer(this.plssLayer);

            this.pointsLayer = new DynamicLayer(config.urls.points);
            this.map.addLayer(this.pointsLayer);
            this.map.addLoaderToLayer(this.pointsLayer);

            this.map.zoomToGeometry = function (geometry) {
                // summary:
                //      Zooms the map to any type of geometry
                // geometry: esri.Geometry
                console.log('agrc.widgets.map.BaseMap::zoomToGeometry', arguments);

                if (geometry.type === 'polygon' || geometry.type === 'polyline' || geometry.type === 'multipoint') {
                    this.setExtent(geometry.getExtent(), true);
                } else {
                    // point
                    this.centerAndZoom(geometry, 16);
                }
            };
        },
        initIdentify: function () {
            // summary:
            //      sets up the identify thang
            //
            console.log('app::initIdentify', arguments);

            this.identifyTask = new IdentifyTask(config.urls.points);

            this.identifyParams = new IdentifyParameters();
            this.identifyParams.tolerance = 3;
            this.identifyParams.returnGeometry = true;
            this.identifyParams.layerIds = [0];
            this.identifyParams.layerOption = IdentifyParameters.LAYER_OPTION_ALL;

            this.own(
                on(this.map, 'click', lang.hitch(this, 'performIdentify'))
            );
        },
        performIdentify: function (evt) {
            // summary:
            //      handles map click event
            // evt
            console.log('app::performIdentify', arguments);

            if (this._graphic) {
                this.map.graphics.remove(this._graphic);
            }

            this.map.showLoader();

            this._graphic = new Graphic(evt.mapPoint,
                new PictureMarkerSymbol(config.urls.pin, 30, 23).setOffset(13, 6));

            this.map.graphics.add(this._graphic);

            this.identifyParams.geometry = evt.mapPoint;
            this.identifyParams.mapExtent = this.map.extent;
            this.identifyTask.execute(this.identifyParams, lang.hitch(this,
                function (result) {
                    this.map.hideLoader();
                    this.emit('identify-success', {
                        results: result
                    });
                }
            ), lang.hitch(this, function () {
                this.map.hideLoader();
            }));
        },
        login: function (evt) {
            // summary:
            //      handles the login click event
            // evt
            console.log('app::login', arguments);

            events.stop(evt);

            var nodes = this.resetValidations(this.loginForm);
            var valid = true;
            //validate input

            nodes.forEach(function (node) {
                if (!node.value || lang.trim(node.value) === '') {
                    domClass.add(node.parentNode, 'has-error');
                    valid = false;
                }
            });

            if (!valid) {
                return;
            }

            var def = xhr(config.urls.authenticate, {
                data: JSON.stringify({
                    username: this.loginEmail.value,
                    password: this.loginPassword.value
                }),
                handleAs: 'json',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            domAttr.set(this.loginNode, 'disabled', true);
            domClass.add(this.loginNode, 'disabled');

            def.then(lang.hitch(this, function (args) {
                $('#loginModal').modal('hide');
                topic.publish('app.authorize', {
                    token: args.result.token
                });
            }), lang.hitch(this, function (args) {
                console.log('app::login::errorCallback', arguments);

                var problems = args.response.data;
                this.displayIssues(problems);
            }));

            def.always(lang.hitch(this, function () {
                domAttr.remove(this.loginNode, 'disabled');
                domClass.remove(this.loginNode, 'disabled');
            }));
        },
        logout: function () {
            // summary:
            //      handles the login click event
            // evt
            console.log('app::updateLogout', arguments);

            xhr(config.urls.leave, {
                handleAs: 'json',
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            topic.publish('app.authorize', {
                token: null
            });
        },
        reset: function () {
            console.log('app::reset');

            var def = xhr(config.urls.reset, {
                data: JSON.stringify({
                    username: this.loginEmail.value
                }),
                handleAs: 'json',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            domAttr.set(this.resetNode, 'disabled', true);
            domClass.add(this.resetNode, 'disabled');
            domAttr.set(this.loginPassword, 'value', '');

            def.then(lang.hitch(this, function () {
                alert('your new password is in your email');
            }, function () {
                alert('there was a problem resetting your pasword');
            }));

            def.always(lang.hitch(this, function () {
                domAttr.remove(this.resetNode, 'disabled');
                domClass.remove(this.resetNode, 'disabled');
            }));
        },
        authorize: function () {
            // summary:
            //      handles the login click event
            console.log('app::authorize', arguments);

            xhr(config.urls.authorize, {
                handleAs: 'json',
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(
                function (args) {
                    console.log('app::authorize::successCallback', args);
                    topic.publish('app.authorize', {
                        token: args.result.token
                    });
                },
                function () {
                    console.log('app::authorize::errorCallback');
                    topic.publish('app.authorize', {
                        token: null
                    });
                });
        },
        register: function (evt) {
            // summary:
            //      handles the login click event
            // evt
            console.log('app::register', arguments);

            events.stop(evt);

            var formNodes = this.resetValidations(this.registerForm);
            var valid = true;
            //validate input

            formNodes.forEach(function (node) {
                if (!node.value || lang.trim(node.value) === '') {
                    domClass.add(node.parentNode, 'has-error');
                    valid = false;
                }
            });

            if (!valid) {
                return;
            }

            var def = xhr(config.urls.register, {
                data: JSON.stringify({
                    email: this.registerEmail.value,
                    password: this.registerPassword.value,
                    passwordAgain: this.registerPassword2.value,
                    firstName: this.registerFname.value,
                    lastName: this.registerLname.value,
                    license: this.registerLicense.value
                }),
                handleAs: 'json',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            domAttr.set(this.registerButtonNode, 'disabled', true);
            domClass.add(this.registerButtonNode, 'disabled');

            var widget = this;
            def.then(
                function (args) {
                    $('#registerModal').modal('hide');

                    topic.publish('app.authorize', {
                        token: args.result.token
                    });
                },
                function (args) {
                    console.log('app::register::errorCallback', arguments);

                    var problems = args.response.data;
                    widget.displayIssues(problems);
                }
            );

            def.always(lang.hitch(this, function () {
                domAttr.remove(this.registerButtonNode, 'disabled');
                domClass.remove(this.registerButtonNode, 'disabled');
            }));
        },
        updateValidation: function (evt) {
            // summary:
            //      handles the ui stuffs
            // evt: on change event
            console.log('app::updateValidation');

            var node = evt.target;

            if (!domAttr.get(node, 'data-required')) {
                return;
            }

            domClass.remove(node.parentNode, 'has-error');
            domClass.remove(node.parentNode, 'has-success');
            query('.help-block', node.parentNode).html();

            if (!node.value || lang.trim(node.value) === '') {
                domClass.add(node.parentNode, 'has-error');
            }
        },
        displayIssues: function (issues) {
            console.log('app::displayIssues');

            array.forEach(issues, function (issue) {
                var node = dom.byId(issue.key);
                var parent = node.parentNode;

                domClass.add(parent, 'has-error');
                query('.help-block', parent).html(issue.value);
            });
        },
        resetValidations: function (form) {
            var nodes = query('[data-required="true"]', form);
            //reset validation

            query('.help-block', form).html();

            nodes.forEach(function (node) {
                domClass.remove(node.parentNode, 'has-error');
                domClass.remove(node.parentNode, 'has-success');
            });

            return nodes;
        },
        getUrls: function () {
            console.log('app::getUrls');

            xhr('/config', {
                handleAs: 'json',
                method: 'GET',
                sync: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(function (urls) {
                lang.mixin(config.urls, urls);
            });
        }
    });
});
