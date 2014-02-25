/*jshint unused:false */
var profile = {
    basePath: '../src',
    action: 'release',
    cssOptimize: 'comments',
    mini: true,
    optimize: 'closure',
    layerOptimize: 'closure',
    stripConsole: 'all',
    selectorEngine: 'acme',
    layers: {
        'app/Tiesheet': {
            include: [
                'dojo/i18n',
                'dojo/domReady',
                'app/main',
                'app/Tiesheet',
                'esri/dijit/Attribution'
            ],
            customBase: true,
            boot: true
        },
        'app/App': {
            include: [
                'dojo/i18n',
                'dojo/domReady',
                'app/main',
                'app/App',
                'esri/dijit/Attribution'
            ],
            customBase: true,
            boot: true
        }
    },
    packages: ['dojo', 'dijit', 'dojox', 'app', 'esri', 'mustache', 'plss', 'agrc', 'ijit', 'jquery', 'bootstrap'],
    staticHasFeatures: {
        // The trace & log APIs are used for debugging the loader, so we don’t need them in the build
        'dojo-trace-api': 0,
        'dojo-log-api': 0,

        // This causes normally private loader data to be exposed for debugging, so we don’t need that either
        'dojo-publish-privates': 0,

        // We’re fully async, so get rid of the legacy loader
        'dojo-sync-loader': 0,

        // dojo-xhr-factory relies on dojo-sync-loader
        'dojo-xhr-factory': 0,

        // We aren’t loading tests in production
        'dojo-test-sniff': 0
    }
};