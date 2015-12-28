/**
 * CODE ANALYZING TASKS
 */
'use strict';

var gulp = require('gulp');
var config = require('../gulp.config')();
var $ = require('gulp-load-plugins')({lazy: true});
var args = require('yargs').argv;
var errorLogger = require('../utils/errorLogger.gulp');
var glob = require('glob');
var log = $.util.log;
var messageLogger = require('../utils/messageLogger.gulp')();
var runSeq = require('run-sequence');

// Lint E2E test files
gulp.task('eslint:e2e', function () {
  var files = [].concat(
    config.test + '/e2e-protractor/squared/*_spec.js',
    config.test + '/e2e-protractor/huron/*_spec.js'
  );
  messageLogger('Running eslint on E2E test files', files);
  return gulp
    .src(files)
    .pipe($.eslint({
      configFile: 'config/eslint.json',
      rulePaths: ['config/rules']
    }))
    .pipe($.eslint.format())
    .pipe($.eslint.failOnError());
});

// vet JS files and create coverage report
gulp.task('analyze', ['jsBeautifier:beautify'], function (done) {
  messageLogger('Analyzing source with JSHint, JSCS, and Plato');
  runSeq([
    'analyze:jscs',
    'analyze:jshint',
    'plato',
  ], done);
});

gulp.task('analyze:jshint', function () {
  var files = [].concat(
    config.appFiles.js,
    config.unsupportedDir + '/' + config.unsupported.file,
    config.testFiles.spec.all,
    'gulpfile.js'
  );
  messageLogger('Running JSHint on JavaScript files', files);
  return gulp
    .src(files)
    .pipe($.if(args.verbose, $.print()))
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish', {
      verbose: true
    }))
    .pipe($.jshint.reporter('fail'));
});

gulp.task('analyze:jscs', function () {
  messageLogger('Running JSCS on JavaScript files', config.appFiles.js);
  return gulp
    .src(config.appFiles.js)
    .pipe($.if(args.verbose, $.print()))
    .pipe($.jscs())
    .pipe($.jscs.reporter())
    .on('error', errorLogger);
});

// Create a visualizer report
gulp.task('plato', function (done) {
  messageLogger('Analyzing source with Plato');
  log('Browse to /report/plato/index.html to see Plato results');
  startPlatoVisualizer(done);
});

/////////////////////////////

// Start Plato inspector and visualizer
function startPlatoVisualizer(done) {
  messageLogger('Running Plato');
  var files = glob.sync('app/**/*.js');
  var excludeFiles = /.*\.spec\.js/;
  var plato = require('plato');
  var options = {
    title: 'Plato Inspections Report',
    exclude: excludeFiles
  };
  var outputDir = 'plato';
  plato.inspect(files, outputDir, options, platoCompleted);

  function platoCompleted(report) {
    var overview = plato.getOverviewReport(report);
    if (args.verbose) {
      log(overview.summary);
    }
    if (done) {
      done();
    }
  }
}
