((function () {
    var config = {
        baseUrl: '/src',
        packages: [
            'agrc',
            'app',
            'dgauges',
            'dgrid',
            'dijit',
            'dojo',
            'dojox',
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
