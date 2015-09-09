module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: {
            build: ['dist']
        },
        dojo: {
            prod: {
                options: {
                    // You can also specify options to be used in all your tasks
                    profiles: ['profiles/prod.build.profile.js', 'profiles/build.profile.js'] // Profile for build
                }
            },
            stage: {
                options: {
                    // You can also specify options to be used in all your tasks
                    profiles: ['profiles/stage.build.profile.js', 'profiles/build.profile.js'] // Profile for build
                }
            },
            options: {
                // You can also specify options to be used in all your tasks
                dojo: 'src/dojo/dojo.js', // Path to dojo.js file in dojo source
                load: 'build', // Optional: Utility to bootstrap (Default: 'build')
                releaseDir: '../dist',
                require: 'src/app/run.js', // Optional: Module to require for the build (Default: nothing)
                basePath: './src'
            }
        },
        esri_slurp: {
            options: {
                version: '3.13'
            },
            dev: {
                options: {
                    beautify: true
                },
                dest: 'src/esri'
            },
            travis: {
                dest: 'src/esri'
            }
        },
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

    // Default task.
    grunt.registerTask('default', ['jshint',
        'connect',
        'watch'
    ]);
    grunt.registerTask('build-prod', [
        'clean:build',
        'if-missing:esri_slurp:dev',
        'dojo:prod'
    ]);
    grunt.registerTask('build-stage', [
        'clean:build',
        'if-missing:esri_slurp:dev',
        'dojo:stage'
    ]);
};
