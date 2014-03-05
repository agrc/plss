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
        jshint: {
            files: [
                'app/**/*.js',
                'Gruntfile.js',
                'app.profile.js'
            ],
            options: {
                jshintrc: '.jshintrc',
                ignores: ['dist/**/*.js']
            }
        },
        connect: {
            uses_defaults: {}
        }
    });

    // Register tasks.
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    // Default task.
    grunt.registerTask('default', ['jshint', 'connect', 'watch']);
};