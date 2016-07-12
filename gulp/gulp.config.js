/**
 * This file/module contains all configuration for the gulp build process.
 */
'use strict';

module.exports = function () {
  var build = 'build';
  var dist = 'dist';
  var app = 'app';
  var appModules = 'app/modules';
  var test = 'test';
  var e2e = test + '/e2e-protractor';
  var node_modules = 'node_modules';
  var now = new Date();
  var year = now.getFullYear();
  var gulpFiles = 'gulp/**/*.js';
  var tsSpecSuffix = '.spec.ts.js';
  var tsSuffix = '.ts.js';
  var compiledTestFiles = app + '/**/*' + tsSpecSuffix;
  var examples = 'examples';
  var cache = '.cache';
  var tsManifest = '/../ts/ts-manifest.txt';
  var tsTestManifest = '/../ts/ts-test-manifest.txt';

  var config = {
    build: build,
    dist: dist,
    test: test,
    vendor: node_modules,
    coverage: 'coverage',
    e2e: e2e,
    e2eFailRetry: '.e2e-fail-retry',
    e2eFailRetrySpecLists: cache + '/e2e-fail-retry-run-*',
    e2eReports: e2e + '/reports',
    app: 'app',
    fonts: 'fonts',
    images: 'images',
    css: 'styles',
    docs: 'docs',
    cssName: 'main',
    cache: cache,
    examples: examples,
    tsManifest: tsManifest,
    tsTestManifest: tsTestManifest,
    gulpFiles: gulpFiles,

    appFiles: {
      js: [
        app + '/modules/**/*.js',
        app + '/scripts/**/*.js'
      ],
      notJsSpec: [
        '!' + app + '/modules/**/*.spec.js',
        '!' + app + '/scripts/**/*.spec.js'
      ],
      notTs: [
        '!' + app + '/modules/**/*.ts.js',
        '!' + app + '/scripts/**/*.js'
      ],
      json: app + '/**/*.json',
      csv: app + '/**/*.csv',
      docs: app + '/docs/**/*',
      tpl: app + '/modules/**/*.html',
      html: app + '/*.html',
      scss: 'styles/app.scss',
      images: app + '/images',
      lang: app + '/l10n/*.json',
    },

    typeScript: {
      appFiles: app + '/**/*.ts',
      testFiles: app + '/**/*.spec.ts',
      compiledSuffix: tsSuffix,
      compiledTestSuffix: tsSpecSuffix,
      compiledTestFiles: compiledTestFiles
    },

    templateCache: {
      file: 'templates.module.js',
      options: {
        module: 'templates-app',
        standalone: true,
        moduleSystem: 'IIFE',
        root: 'modules',
      },
      dest: build + '/modules/core/templates',
    },

    typeDefs: ['typings/**/*.ts'],

    testFiles: {
      karmaTpl: 'karma/karma-conf.tpl.js',
      app: {
        all: [
          build + '/scripts/**/*.js',
          build + '/modules/**/*.module.js',
          build + '/modules/**/*.js',
        ],
        bootstrap: build + '/scripts/**/!(types.ts).js',
        moduleDecl: build + '/modules/**/*.module.js',
        appJsFiles: build + '/modules/**/!(global.spec|*.ts).js'
      },
      notTs: [
        '!' + build + '/scripts/**/*.ts.js',
        '!' + build + '/scripts/**/*.ts.spec.js',
        '!' + build + '/modules/**/*.module.ts.js',
        '!' + build + '/modules/**/*.module.ts.spec.js',
        '!' + build + '/modules/**/*.ts.js',
        '!' + build + '/modules/**/*.ts.spec.js'
      ],
      js: [
        node_modules + '/angular-mocks/angular-mocks.js',
        node_modules + '/jasmine-jquery/lib/jasmine-jquery.js',
        node_modules + '/sinon-ng/sinon-ng.js',
        node_modules + '/jasmine-promise-matchers/dist/jasmine-promise-matchers.js',
        node_modules + '/bardjs/dist/bard.js',
        node_modules + '/jasmine-sinon/lib/jasmine-sinon.js',
        node_modules + 'karma-ng-html2js-preprocessor/lib/index.js'
      ],
      global: [
        test + '/global.spec.js',
      ],
      spec: {
        all: app + '/**/*.spec.js',
        core: appModules + '/core/**/*.spec.js',
        ediscovery: appModules + '/ediscovery/**/*.spec.js',
        example: [examples + '/unit/example.module.js', examples + '/unit/*'],
        hercules: appModules + '/hercules/**/*.spec.js',
        huron: appModules + '/huron/**/*.spec.js',
        mediafusion: appModules + '/mediafusion/**/*.spec.js',
        messenger: appModules + '/messenger/**/*.spec.js',
        squared: appModules + '/squared/**/*.spec.js',
        sunlight: appModules + '/sunlight/**/*.spec.js',
        webex: appModules + '/webex/**/*.spec.js'
      },
      e2e: {
        hercules: e2e + '/hercules/**/*_spec.js',
        huron: e2e + '/huron/**/*_spec.js',
        mediafusion: e2e + '/mediafusion/**/*_spec.js',
        squared: e2e + '/squared/**/*_spec.js',
        webex: e2e + '/webex/**/*_spec.js',
        sunlight: e2e + '/sunlight/**/*_spec.js',
        regression: e2e + '/regression/**/*_spec.js',
      }
    },

    vendorFiles: {
      js: [
        node_modules + '/x2js/xml2json.min.js',
        node_modules + '/jquery/dist/jquery.js',
        node_modules + '/emailjs-addressparser/src/emailjs-addressparser.js',
        node_modules + '/collab-amcharts/amcharts/amcharts.js',
        node_modules + '/collab-amcharts/amcharts/pie.js',
        node_modules + '/collab-amcharts/amcharts/serial.js',
        node_modules + '/collab-amcharts/amcharts/funnel.js',
        node_modules + '/collab-amcharts/amcharts/gantt.js',
        node_modules + '/collab-amcharts/amcharts/plugins/export/export.js',
        node_modules + '/collab-amcharts/amcharts/plugins/export/libs/fabric.js/fabric.js',
        node_modules + '/collab-amcharts/amcharts/plugins/export/libs/blob.js/blob.js',
        node_modules + '/collab-amcharts/amcharts/plugins/export/libs/jszip.js/jszip.js',
        node_modules + '/collab-amcharts/amcharts/plugins/export/libs/FileSaver.js/FileSaver.js',
        node_modules + '/collab-amcharts/amcharts/plugins/export/libs/pdfmake/pdfmake.js',
        node_modules + '/collab-amcharts/amcharts/plugins/export/libs/pdfmake/vfs_fonts.js',
        node_modules + '/typeahead.js/dist/typeahead.bundle.js',
        node_modules + '/lodash/index.js',
        node_modules + '/draggable.js/draggable.js',
        node_modules + '/moment/moment.js',
        node_modules + '/jquery.nicescroll/jquery.nicescroll.js',
        node_modules + '/punycode/punycode.js',
        node_modules + '/angular/angular.js',
        node_modules + '/angular-animate/angular-animate.js',
        node_modules + '/angular-cookies/angular-cookies.js',
        node_modules + '/angular-sanitize/angular-sanitize.js',
        node_modules + '/angular-resource/angular-resource.js',
        node_modules + '/angular-messages/angular-messages.js',
        node_modules + '/angular-translate/dist/angular-translate.js',
        node_modules + '/angular-translate-loader-static-files/angular-translate-loader-static-files.js',
        node_modules + '/messageformat/messageformat.js',
        node_modules + '/messageformat/locale/*.js',
        node_modules + '/angular-translate-interpolation-messageformat/angular-translate-interpolation-messageformat.js',
        node_modules + '/angular-ui-router/release/angular-ui-router.js',
        node_modules + '/ui-router-extras/release/modular/ct-ui-router-extras.core.js',
        node_modules + '/ui-router-extras/release/modular/ct-ui-router-extras.sticky.js',
        node_modules + '/ui-router-extras/release/modular/ct-ui-router-extras.transition.js',
        node_modules + '/ui-router-extras/release/modular/ct-ui-router-extras.future.js',
        node_modules + '/ui-router-extras/release/modular/ct-ui-router-extras.previous.js',
        node_modules + '/ng-csv/build/ng-csv.js',
        node_modules + '/api-check/dist/api-check.js',
        node_modules + '/angular-formly/dist/formly.js',
        node_modules + '/collab-ui-angular/dist/collab-ui.js',
        node_modules + '/collab-ui-angular/dist/collab-formly.js',
        node_modules + '/angular-ui-grid/ui-grid.js',
        node_modules + '/bootstrap-tokenfield/dist/bootstrap-tokenfield.js',
        node_modules + '/moment-timezone/builds/moment-timezone-with-data-2010-2020.js',
        node_modules + '/moment-range/dist/moment-range.js',
        node_modules + '/d3/d3.js',
        node_modules + '/jquery-csv/src/jquery.csv.js',
        node_modules + '/angular-timer/dist/angular-timer.js',
        node_modules + '/angular-timer/bower_components/humanize-duration/humanize-duration.js',
        node_modules + '/angular-libphonenumber/dist/libphonenumber.full.js',
        node_modules + '/angular-libphonenumber/dist/angular-libphonenumber.js',
        node_modules + '/angularjs-toaster/toaster.js',
        node_modules + '/ng-file-upload/dist/ng-file-upload.js',
        node_modules + '/jstimezonedetect/dist/jstz.js',
        node_modules + '/masonry-layout/dist/masonry.pkgd.js',
        node_modules + '/imagesloaded/imagesloaded.pkgd.js',
        node_modules + '/ng-tags-input/build/ng-tags-input.js',
        node_modules + '/pako/dist/pako.js',
        node_modules + '/angular-cache/dist/angular-cache.js',
        node_modules + '/clipboard/dist/clipboard.js',
        node_modules + '/ngclipboard/dist/ngclipboard.js',
        node_modules + '/query-command-supported/dist/queryCommandSupported.js',
        node_modules + '/ical.js/build/ical.js',
        node_modules + '/angular-ical/dist/js/angular-ical.js'
      ],
      scss: {
        paths: [
          './' + node_modules + '/bootstrap-sass/assets/stylesheets',
          './' + node_modules + '/foundation-sites/scss',
        ],
        files: [
          node_modules + '/collab-ui/scss/**/*.scss',
        ]
      },
      css: [
        node_modules + '/ng-tags-input/build/ng-tags-input.css',
        node_modules + '/collab-amcharts/amcharts/plugins/export/export.css',
      ],
      fonts: [
        node_modules + '/collab-ui/fonts/*',
        node_modules + '/font-awesome/fonts/*',
      ],
      images: [
        node_modules + '/collab-ui/images/*',
        node_modules + '/collab-amcharts/amcharts/images/*',
      ]
    },

    banner: '/**\n' +
      ' * <%= pkg.name %> v<%= pkg.version %> (<%= pkg.homepage %>)\n' +
      ' * Copyright ' + year + ' <%= pkg.author %>\n' +
      ' */\n' +
      '',

    beautifyFiles: [
      app + '/**/*.js',
      app + '/**/*.json',
      test + '/**/*.js',
      test + '/**/*.json',
      gulpFiles,
      '!' + compiledTestFiles,
      '!test/karma-unit.js',
      '!karma.conf.js'
    ]
  };

  return config;
};
