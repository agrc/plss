/*jshint unused:false */
var profile = {
    basePath: '../src',
    action: 'release',
    cssOptimize: 'comments',
    mini: true,
    optimize: 'uglify',
    layerOptimize: 'uglify',
    stripConsole: 'all',
    selectorEngine: 'acme',
    layers: {
        'dojo/plss': {
            include: [
                'dojo/i18n',
                'dojo/domReady',
                'app/run',
                'app/App',
                'dojox/gfx/path',
                'dojox/gfx/svg',
                'dojox/gfx/shape',
                'esri/dijit/Attribution'
            ],
            targetStylesheet: 'app/resources/App.css',
            includeLocales: ['en-us'],
            customBase: true,
            boot: true
        },
        'dojo/tiesheet': {
            include: [
                'app/runTiesheet',
                'app/Tiesheet'
            ],
            includeLocales: ['en-us'],
            customBase: true,
            boot: true
        }
    },
    userConfig: {
        packages: ['app', 'agrc', 'dijit', 'ijit', 'plss', 'esri']
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
