/**
 * This file/module contains all configuration for the build process.
 */
module.exports = {

  build_dir: 'build',
  compile_dir: 'dist',
  test_dir: 'test',
  e2e_dir: 'test/e2e-protractor',
  app_dir: 'app',
  unsupported_app: 'unsupported',
  unsupported_app_dir: 'app/unsupported',

  app_files: {
    js: [
      'modules/**/*.js',
      'scripts/**/*.js',
      '!**/*.spec.js',
      '!bower_components/**/*.js'
    ],
    jsunit: [
      'test/**/spec/**/*.js',
      '!bower_components/**/*.js'
    ],
    json: [
      '**/*.json',
      '!bower_components/**/*.json'
    ],

    atpl: ['modules/**/*.html'],

    html: ['*.html'],
    less: ['styles/app.less']

  },

  test_files: {
    js: [
      'bower_components/angular-mocks/angular-mocks.js'
    ]
  },

  vendor_files: {
    unsupported: [
      'bower_components/json3/lib/json3.min.js',
      'bower_components/angular/angular.js',
      'bower_components/angular-translate/angular-translate.js',
      'bower_components/angular-translate-loader-static-files/angular-translate-loader-static-files.js'
    ],
    js: [
      'bower_components/jquery/dist/jquery.js',
      'bower_components/bootstrap/dist/js/bootstrap.js',
      'bower_components/addressparser/src/addressparser.js',
      'bower_components/alertify.js/lib/alertify.js',
      'bower_components/amcharts/dist/amcharts/amcharts.js',
      'bower_components/amcharts/dist/amcharts/pie.js',
      'bower_components/amcharts/dist/amcharts/serial.js',
      'bower_components/typeahead.js/dist/typeahead.bundle.js',
      'bower_components/lodash/dist/lodash.compat.js',
      'bower_components/draggable/draggable.min.js',
      'bower_components/moment/moment.js',
      'bower_components/base64/base64.js',
      'bower_components/nicescroll/jquery.nicescroll.js',
      'bower_components/angular/angular.js',
      'bower_components/angular-animate/angular-animate.js',
      'bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
      'bower_components/angular-ui-utils/ui-utils.js',
      'bower_components/angular-cookie/angular-cookie.js',
      'bower_components/angular-cookies/angular-cookies.js',
      'bower_components/angular-sanitize/angular-sanitize.js',
      'bower_components/angular-dialog-service/dialogs.js',
      'bower_components/angular-resource/angular-resource.js',
      'bower_components/angular-route/angular-route.js',
      'bower_components/angular-translate/angular-translate.js',
      'bower_components/angular-translate-loader-static-files/angular-translate-loader-static-files.js',
      'bower_components/angular-ui-router/release/angular-ui-router.js',
      'bower_components/ui-router-extras/release/ct-ui-router-extras.js',
      'bower_components/ng-csv/build/ng-csv.min.js',
      'bower_components/bootstrap-cisco-ng/dist/cisco-ui-tpls.js',
      'bower_components/angular-wizard/dist/angular-wizard.js',
      'bower_components/ng-grid/build/ng-grid.js',
      'bower_components/bootstrap-tokenfield/dist/bootstrap-tokenfield.js'
    ],
    css: [
      'bower_components/alertify.js/themes/alertify.core.css',
      'bower_components/alertify.js/themes/alertify.default.css',
      'bower_components/angular-wizard/dist/angular-wizard.css',
      'bower_components/angular-dialog-service/dialogs.css',
      //'bower_components/ng-grid/ng-grid.css',
      'bower_components/bootstrap-tokenfield/dist/css/bootstrap-tokenfield.css'
    ],
    fonts: [
      'bower_components/bootstrap-cisco/dist/fonts/*',
      'bower_components/font-awesome/fonts/*'
    ],
    images: [
      'bower_components/bootstrap-cisco/dist/images/*'
    ]
  },

  html_lint: {
    customtags: [
      'cs-*',
      'cr-*',
      'hn-*',
      'hs-*',
      'progressbar'
    ],
    customattrs: [
      'cs-*',
      'cr-*',
      'hn-*',
      'hs-*',
      'translate',
      'gridscrollbar',
      'filename',
      'windowsize',
      'progressbar',
      'navstyle',
      'headertitle',
      'modal-transclude'
    ],
    relaxerror: [
      'for attribute translate',
      'Attribute href without an explicit value seen. The attribute may be dropped by IE7.',
      'Empty heading.',
      'Element style not allowed as child of element body in this context.',
      'Element img is missing required attribute src.',
      'Element ul not allowed as child of element button in this context.',
      'for attribute aria-valuenow',
      'for attribute aria-valuemax',
      'Element option without attribute label must not be empty',
      'Bad value {{$parent.currentTrial.daysUsed}} for attribute aria-valuenow on element div: Expected a minus sign or a digit but saw { instead.',
      'Bad value {{$parent.currentTrial.duration}} for attribute aria-valuemax on element div: Expected a minus sign or a digit but saw { instead.',
      'The element button must not appear as a descendant of the a element.'
    ]
  }

};
