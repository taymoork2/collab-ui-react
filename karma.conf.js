var webpackConfig = require('./webpack.config');
var args = require('yargs').argv;

module.exports = function (config) {
  var _config = {

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
        pattern: 'karma.shim.js',
        watched: false
      },
    ],

    exclude: [],

    preprocessors: {
      'karma.shim.js': ['webpack', 'sourcemap']
    },

    webpack: webpackConfig,

    webpackMiddleware: {
      stats: 'errors-only'
    },

    coverageReporter: {
      dir: 'test/coverage/',
      reporters: [{
          type: 'cobertura',
          subdir: 'cobertura'
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

    singleRun: true
  };

  config.set(_config);
};
