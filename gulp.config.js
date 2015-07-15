/**
 * This file/module contains all configuration for the gulp build process.
 */
'use strict';

module.exports = function() {
  var pkg = require('./package.json');

  var build = 'build';
  var dist = 'dist';
  var app = 'app';
  var test = 'test';
  var e2e = test + '/e2e-protractor';
  var vendor = 'bower_components';
  var node_modules = 'node_modules';
  var now = new Date();
  var year = now.getFullYear();

  var config = {
    build: build,
    dist: dist,
    test: test,
    vendor: vendor,
    coverage: 'coverage',
    e2e: 'test/e2e-protractor',
    app: 'app',
    unsupportedDir: 'app/unsupported',
    fonts: 'fonts',
    images: 'images',
    css: 'styles',
    cssName: 'main',
    jsIndexName: 'index.scripts',
    jsUnsupportedName: 'unsupported.scripts',

    appFiles: {
      js: [
        app + '/modules/**/*.js',
        app + '/scripts/**/*.js'
      ],
      json: [app + '/**/*.json'],
      csv: [app + '/**/*.csv'],
      tpl: [app + '/modules/**/*.html'],
      html: [app + '/*.html'],
      scss: ['styles/app.scss'],
      images: [app + '/images'],
      lang: [app + '/l10n/*.json']
    },

    unsupported: {
      dir: 'unsupported',
      file: 'unsupportedApp.js',
      js: [
        app + '/unsupported/**/*.js'
      ],
      name: 'unsupported.scripts'
    },

    templateCache: {
      file: 'templates.module.js',
      options: {
        module: 'templates-app',
        standalone: true,
        moduleSystem: 'IIFE',
        root: 'modules'
      },
      dest: build + '/modules/core/templates'
    },

    testFiles: {
      karmaTpl: 'karma/karma-conf.tpl.js',
      karmaWatchTpl: 'karma/karma.watch.tpl.js',
      app: [
        build + '/scripts/**/*.js',
        build + '/modules/**/*.js'
      ],
      js: [
        vendor + '/angular-mocks/angular-mocks.js',
        vendor + '/jasmine-jquery/lib/jasmine-jquery.js',
        vendor + '/sinon-ng/sinon-ng.js',
        vendor + '/es5-shim/es5-shim.js',
        node_modules + '/jasmine-promise-matchers/dist/jasmine-promise-matchers.js',
      ],
      global: [
        test + '/global.spec.js'
      ],
      spec: [
        test + '/core/**/*.js',
        test + '/huron/**/*.js',
        test + '/hercules/**/*.js',
        test + '/mediafusion/**/*.js',
        test + '/squared/**/*.js',
        '!' + test + '/e2e-protractor/**/*'
      ],
      e2e: {
        hercules: e2e + '/hercules/**/*_spec.js',
        huron: e2e + '/huron/**/*_spec.js',
        mediafusion: e2e + '/mediafusion/**/*_spec.js',
        squared: e2e + '/squared/**/*_spec.js',
        webex: e2e + '/webex/**/*_spec.js'
      }
    },

    vendorFiles: {
      unsupported: [
        vendor + '/json3/lib/json3.min.js',
        vendor + '/angular/angular.js',
        vendor + '/angular-translate/angular-translate.js',
        vendor + '/angular-translate-loader-static-files/angular-translate-loader-static-files.js'
      ],
      js: [
        vendor + '/x2js/xml2json.js',
        vendor + '/jquery/dist/jquery.js',
        vendor + '/bootstrap/dist/js/bootstrap.js',
        vendor + '/addressparser/src/addressparser.js',
        vendor + '/alertify.js/lib/alertify.js',
        vendor + '/amcharts/dist/amcharts/amcharts.js',
        vendor + '/amcharts/dist/amcharts/pie.js',
        vendor + '/amcharts/dist/amcharts/serial.js',
        vendor + '/amcharts/dist/amcharts/funnel.js',
        vendor + '/typeahead.js/dist/typeahead.bundle.js',
        vendor + '/lodash/dist/lodash.compat.js',
        vendor + '/draggable/draggable.min.js',
        vendor + '/moment/moment.js',
        vendor + '/base64/base64.js',
        vendor + '/nicescroll/jquery.nicescroll.js',
        vendor + '/angular/angular.js',
        vendor + '/angular-animate/angular-animate.js',
        vendor + '/angular-bootstrap/ui-bootstrap-tpls.js',
        vendor + '/angular-ui-utils/ui-utils.js',
        vendor + '/angular-cookie/angular-cookie.js',
        vendor + '/angular-cookies/angular-cookies.js',
        vendor + '/angular-sanitize/angular-sanitize.js',
        vendor + '/angular-dialog-service/dialogs.js',
        vendor + '/angular-resource/angular-resource.js',
        vendor + '/angular-route/angular-route.js',
        vendor + '/angular-messages/angular-messages.js',
        vendor + '/angular-translate/angular-translate.js',
        vendor + '/angular-translate-loader-static-files/angular-translate-loader-static-files.js',
        vendor + '/messageformat/messageformat.js',
        vendor + '/angular-translate-interpolation-messageformat/angular-translate-interpolation-messageformat.js',
        vendor + '/angular-ui-router/release/angular-ui-router.js',
        vendor + '/ui-router-extras/release/modular/ct-ui-router-extras.core.js',
        vendor + '/ui-router-extras/release/modular/ct-ui-router-extras.sticky.js',
        vendor + '/ui-router-extras/release/modular/ct-ui-router-extras.transition.js',
        vendor + '/ui-router-extras/release/modular/ct-ui-router-extras.previous.js',
        vendor + '/ng-csv/build/ng-csv.min.js',
        vendor + '/api-check/dist/api-check.js',
        vendor + '/angular-formly/dist/formly.js',
        vendor + '/cisco-formly/dist/cisco-formly-tpls.js',
        vendor + '/bootstrap-cisco-ng/dist/cisco-ui-tpls.js',
        vendor + '/angular-wizard/dist/angular-wizard.js',
        vendor + '/ng-grid/build/ng-grid.js',
        vendor + '/bootstrap-tokenfield/dist/bootstrap-tokenfield.js',
        vendor + '/moment-timezone/builds/moment-timezone-with-data-2010-2020.js',
        vendor + '/ng-clip/src/ngClip.js',
        vendor + '/zeroclipboard/dist/ZeroClipboard.js',
        vendor + '/d3/d3.min.js',
        vendor + '/jquery-csv/src/jquery.csv.js',
        vendor + '/angular-timer/dist/angular-timer.js',
        vendor + '/humanize-duration/humanize-duration.js'
      ],
      scss: [
        vendor + '/bootstrap-cisco/scss/**/*.scss'
      ],
      css: [
        vendor + '/alertify.js/themes/alertify.core.css',
        vendor + '/alertify.js/themes/alertify.default.css',
        vendor + '/angular-wizard/dist/angular-wizard.css',
        vendor + '/angular-dialog-service/dialogs.css',
        vendor + '/animate.css/animate.css'
      ],
      fonts: [
        vendor + '/bootstrap-cisco/dist/fonts/*',
        vendor + '/font-awesome/fonts/*'
      ],
      images: [
        vendor + '/bootstrap-cisco/dist/images/*'
      ]
    },

    banner: '/**\n' +
      ' * <%= pkg.name %> v<%= pkg.version %> (<%= pkg.homepage %>)\n' +
      ' * Copyright ' + year + ' <%= pkg.author %>\n' +
      ' */\n' +
      '',

  };

  return config;
};
