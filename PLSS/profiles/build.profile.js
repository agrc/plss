/*jshint unused:false */
var profile = {
    basePath: '../src',
    action: 'release',
    cssOptimize: 'comments',
    mini: true,
    optimize: undefined,//'closure',
    layerOptimize: 'closure',
    stripConsole: 'all',
    selectorEngine: 'acme',
    layers: {
        'app/Tiesheet': {
            include: [
                'app/runTiesheet'
            ],
            includeLocales: ['en-us'],
            customBase: true, //replaces the dojo main.
            boot: true //includes the module loader.
        },
        'app/App': {
            include: [
                'app/runApp',
                'esri/dijit/Attribution',
                'dojox/gfx/path',
                'dojox/gfx/svg',
                'dojox/gfx/shape'
            ],
            includeLocales: ['en-us'],
            customBase: true,
            boot: true
        }
    },
    staticHasFeatures: {
        // The trace & log APIs are used for debugging the loader,
        // so we don’t need them in the build
        'dojo-trace-api': 0,
        'dojo-log-api': 0,

        // This causes normally private loader data to be exposed for debugging,
        // so we don’t need that either
        'dojo-publish-privates': 0,

        // We’re fully async, so get rid of the legacy loader
        'dojo-sync-loader': 0,

        // dojo-xhr-factory relies on dojo-sync-loader
        'dojo-xhr-factory': 0,

        // We aren’t loading tests in production
        'dojo-test-sniff': 0
    }
};