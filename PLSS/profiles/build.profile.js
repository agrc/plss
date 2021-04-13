/*eslint-disable no-unused-vars*/
var profile = {
    basePath: '../src',
    action: 'release',
    cssOptimize: 'comments',
    mini: true,
    optimize: false,
    layerOptimize: false,
    stripConsole: 'all',
    selectorEngine: 'acme',
    layers: {
        'dojo/plss': {
            include: [
                'dojo/i18n',
                'dojo/domReady',
                'app/run',
                'app/App',
                'dojox/gfx/filters',
                'dojox/gfx/path',
                'dojox/gfx/svg',
                'dojox/gfx/svgext',
                'dojox/gfx/shape',
                'esri/dijit/Attribution',
                'esri/layers/VectorTileLayerImpl',
                'esri/layers/vectorTiles/views/vectorTiles/WorkerTileHandler'
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
    packages: [{
        name: 'moment',
        location: 'moment',
        main: 'moment',
        trees: [
            // don't bother with .hidden, tests, min, src, and templates
            ['.', '.', /(\/\.)|(~$)|(test|txt|src|min|templates)/]
        ],
        resourceTags: {
            amd: function (filename, mid) {
                return /\.js$/.test(filename);
            }
        }
    }],
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
        'dojo-test-sniff': 0,
        'dojo-guarantee-console': 1,
        'console-as-object': 0
    },
    plugins: {
        'xstyle/css': 'xstyle/build/amd-css'
    },
    map: {
        '*': {
            'dojox/dgauges': 'dgauges'
        }
    },
    userConfig: {
        packages: ['app', 'agrc', 'dijit', 'ijit', 'plss', 'esri', 'layer-selector']
    }
};
