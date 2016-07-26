module.exports = function (config) {
  'use strict';

  config.set({
    // base path, that will be used to resolve files and exclude
    basePath: '../',

    // time (ms) karma server waits for a browser message before disconnecting from it
    browserNoActivityTimeout: 15000,  // default 10000

    // if a browser disconnects from karma server, re-attempt N times
    //
    // IMPORTANT:
    // - the current combination of npm modules:
    //   - karma@0.13.22
    //   - karma-phantomjs-launcher@1.0.1
    //   - phantomjs-prebuilt@2.1.7
    // - ...exhibit what appears to be a race condition when spawning multiple tasks to
    //   run karma tests in parallel (either via 'gulp karma-parallel' or 'ktest-all')
    // - to mitigate this, we increment the disconnect tolerance to 2
    browserDisconnectTolerance: 2,    // default 0

    // testing framework to use (jasmine/mocha/qunit/...)
    frameworks: ['jasmine', 'sinon'],

    /**
     * This is the list of file patterns to load into the browser during testing.
     */
    files: [
      // inject:unitTestFiles
      // end-inject:unitTestFiles
      , {
        pattern: 'test/fixtures/**/*.json',
        watched: true,
        served: true,
        included: false
      },
      {
        pattern: 'app/**/*.json',
        watched: true,
        served: true,
        included: false
      }
    ],

    preprocessors: {
      'build/scripts/**/*.js': ['coverage'],
      'build/templates-app.js': ['coverage'],
      'build/modules/**/*.js': ['coverage'],
      'examples/unit/!(*.spec).js': ['coverage'],
      'examples/unit/*.html': ['ng-html2js']
    },

    ngHtml2JsPreprocessor: {
      moduleName: 'exampleTemplates'
    },

    coverageReporter: {
      dir: 'coverage/unit',
      reporters: [{
        type: 'html',
        subdir: 'report-html'
      }, {
        type: 'json',
        subdir: 'json',
        file: 'coverage-<module>.json'
      }]
    },

    // list of files / patterns to exclude
    exclude: [],

    // web server port
    port: 8080,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,

    // Start these browsers, currently available:
    // - Chrome
    // - Firefox
    // - PhantomJS
    browsers: [process.env.atlas_karma_browser || 'PhantomJS'],
     //browsers: ['Chrome'],

    // Which plugins to enable
    plugins: [
      'karma-chrome-launcher',
      'karma-coverage',
      'karma-firefox-launcher',
      'karma-htmlfile-reporter',
      'karma-jasmine',
      'karma-junit-reporter',
      'karma-ng-html2js-preprocessor',
      'karma-phantomjs-launcher',
      'karma-sinon'
    ],

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false,

    colors: true,

    reporters: [
      'dots'
      // inject:reporters
    ],

    junitReporter: {
      useBrowserName: false,
      outputFile: 'test/unit-test-results.xml',
      suite: ''
    },

    htmlReporter: {
      outputFile: 'test/unit-test-results.html'
    }
  });
};
