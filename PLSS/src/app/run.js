(function () {
    var projectUrl;
    if (typeof location === 'object') {
        // running in browser
        projectUrl = location.pathname;//.replace(/\/[^\/]+$/, "") + '/';
        // running in unit tests
        projectUrl = (projectUrl === "/") ? '/src/' : projectUrl;
    } else {
        // running in build system
        projectUrl = '';
    }
    
    require({
        packages: [
            {
                name: 'app',
                location: projectUrl + '/src/app'
            }, {
                name: 'agrc',
                location: projectUrl + '/src/agrc'
            }, {
                name: 'ijit',
                location: projectUrl + '/src/ijit'
            }, {
                name: 'mustache',
                location: projectUrl + '/src/mustache'
            }, {
                name: 'bootstrap',
                location: projectUrl + '/src/bootstrap'
            }, {
                name: 'jquery',
                location: projectUrl + '/src/jquery'
            }
        ]
    }, ['app']);
})();