module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        watch: {
            files: [
                'app/**/*.js',
                'app/**/*.html'
            ],
            options: {
                livereload: true
            }
        },
        connect: {
            uses_defaults: {}
        }
    });

    // Register tasks.
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');

    // Default task.
    grunt.registerTask('default', ['connect', 'watch']);
};