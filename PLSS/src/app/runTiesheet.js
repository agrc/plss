((function () {
    var config = {
        baseUrl: '/plss/src',
        packages: [
            'app',
            'agrc',
            'dgauges',
            'dojo',
            'dojox',
            'dijit',
            'dgrid',
            'esri',
            'ijit',
            'layer-selector',
            'moment',
            'plss',
            'put-selector',
            'xstyle',
            {
                name: 'ladda',
                location: './ladda-bootstrap',
                main: 'dist/ladda'
            }, {
                name: 'mustache',
                location: './mustache',
                main: 'mustache'
            }, {
                name: 'jquery',
                location: './jquery/dist',
                main: 'jquery'
            }, {
                name: 'bootstrap',
                location: './bootstrap',
                main: 'dist/js/bootstrap'
            }, {
                name: 'spin',
                location: './spinjs',
                main: 'spin'
            }
        ]
    };
    require(config, ['app/Tiesheet', 'jquery', 'dojo/domReady!'], function () {
    });
})());
