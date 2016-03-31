// Karma configuration
// Generated on Tue Mar 22 2016 02:24:21 GMT-0400 (EDT)

module.exports = function(config) {
  'use strict';
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '..',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jspm', 'jasmine'],


    jspm: {
      loadFiles: [
        'app/**/*.spec.ts',
        'util/**/*.spec.ts'
      ],
      serveFiles: [
        'app/**/*!(*.spec).ts',
        'config/**/*.ts',
        'util/**/*!(*.spec).ts',
        'tsconfig.json'
      ]
    },


    proxies: {
      '/app/': '/base/app/',
      '/config/': '/base/config/',
      '/util/': '/base/util/',
      '/jspm_packages/': '/base/jspm_packages/',
      '/tsconfig.json': '/base/tsconfig.json'
    },


    // list of files / patterns to load in the browser
    files: [
    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor

    // Source files that you wanna generate coverage for.
    // Do not include tests or libraries (these files will be instrumented by Istanbul)
    preprocessors: {
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['PhantomJS'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,


    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
}
