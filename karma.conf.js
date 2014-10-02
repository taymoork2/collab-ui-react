// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html

module.exports = function(config) {
  'use strict';

  config.set({
    // base path, that will be used to resolve files and exclude
    basePath: '',

    // testing framework to use (jasmine/mocha/qunit/...)
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: [
      'app/bower_components/jquery/dist/jquery.js',
      'app/bower_components/angular/angular.js',
      'app/bower_components/angular-mocks/angular-mocks.js',
      'app/bower_components/angular-resource/angular-resource.js',
      'app/bower_components/angular-cookies/angular-cookies.js',
      'app/bower_components/angular-sanitize/angular-sanitize.js',
      'app/bower_components/angular-route/angular-route.js',
      'app/bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
      'app/bower_components/angular-dialog-service/dialogs.js',
      'app/bower_components/angular-translate/angular-translate.js',
      'app/bower_components/ng-csv/build/ng-csv.min.js',
      'app/bower_components/angular-cookie/angular-cookie.js',
      'app/bower_components/ng-grid/build/ng-grid.js',
      'app/bower_components/angular-wizard/dist/angular-wizard.js',
      'app/bower_components/bootstrap-cisco-ng/dist/cisco-ui-tpls.min.js',
      'app/bower_components/angular-translate-loader-static-files/angular-translate-loader-static-files.js',
      'app/bower_components/lodash/dist/lodash.compat.js',
      'app/bower_components/base64/base64.js',
      'app/bower_components/bootstrap-tokenfield/dist/bootstrap-tokenfield.js',
      'app/bower_components/jquery-icheck/icheck.min.js',
      'app/bower_components/alertify.js/lib/alertify.js',
      'app/bower_components/draggable/draggable.min.js',
      'app/bower_components/amcharts/dist/amcharts/amcharts.js',
      'app/bower_components/typeahead.js/dist/typeahead.bundle.js',
      'app/bower_components/moment/moment.js',
      'app/bower_components/angular-ui-utils/ui-utils.js',
      'app/bower_components/angular-ui-router/release/angular-ui-router.js',
      'app/scripts/*.js',
      'app/scripts/**/*.js',
      'app/**/scripts/*.js',
      'app/modules/**/scripts/**/*.js',
      'app/**/scripts/**/*.js',
      'test/**/spec/**/*.js'
    ],

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
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: ['PhantomJS'],

    // Which plugins to enable
    plugins: [
      'karma-phantomjs-launcher',
      'karma-jasmine'
    ],

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false,

    colors: true
  });
};
