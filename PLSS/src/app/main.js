require({
    async: 0
});

define([
    'dojo/parser',

    'jquery/jquery',
    'bootstrap/js/bootstrap',
    'app/App'
], function(parser) {
    window.AGRC = {
        // app: app.App
        //      global reference to App
        app: null,

        // version: String
        //      The version number.
        version: '1.0.0',
        
        //localhost
        //apiKey: 'AGRC-B5D62BD2151902',
        
        //test.mapserv
        apiKey: 'AGRC-FFCDAD6B933051',

        urls: {
            vector: 'http://mapserv.utah.gov/arcgis/rest/services/BaseMaps/Vector/MapServer',
            points: '/arcgis/rest/services/PLSS/MapServer',
            plss: 'http://mapserv.utah.gov/arcgis/rest/services/UtahPLSS/MapServer',
            tieSheets: 'http://turngps.utah.gov/pdf/tiesheets/',
            pin: 'data:image/png;base64,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',
            tiesheet: './secure/tiesheet',
            existing: './secure/tiesheet/existing',
            reset: './reset',
            authorize: './secure/authorize',
            register: './register',
            authenticate: './authenticate',
            leave: 'authenitcate/logout',
            settings: './secure/settings'
        }
    };

    // lights...camera...action!
    parser.parse();
});