var _ = require('lodash');
var webpackConfig = require('./webpack.config');
var args = require('yargs').argv;
var shimFile = args.shimFile || './karma/karma.shim.default.js';
var shimFileName = _.last(shimFile.split('/'));

module.exports = function (config) {
  var _config = {
    preprocessors: {}
  };

  // 'shimFile' from CLI, so set it up separately from main config
  _config.preprocessors[shimFile] = ['webpack', 'sourcemap'];

  // main config
  _.extend(_config, {

    basePath: '',

    frameworks: ['jasmine', 'sinon'],

    files: [
      {
        pattern: './test/fixtures/**/*.json', included: false
      },
      {
        pattern: './app/**/*.json', included: false
      },
      {
        pattern: shimFile,
        watched: false
      },
    ],

    exclude: [],

    webpack: webpackConfig,

    webpackMiddleware: {
      stats: 'errors-only'
    },

    coverageReporter: {
      dir: 'test/coverage/',
      reporters: [{
          type: 'json',
          subdir: 'json',
          file: shimFileName + '.json'
        }, {
          type: 'text-summary'
        }, {
          type: 'html'
        }
      ]
    },

    htmlReporter: {
      outputFile: 'test/unit-test-results.html'
    },

    webpackServer: {
      noInfo: true // please don't spam the console when running in karma!
    },

    reporters: ['progress', 'coverage', 'html'],

    port: 9876,

    colors: true,

    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    autoWatch: false,

    browsers: [args.debug ? 'Chrome' : 'PhantomJS'], // you can also use Chrome

    singleRun: true,

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
  });

  config.set(_config);
};
