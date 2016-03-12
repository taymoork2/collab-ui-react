/**
 * TEMPLATE CACHING TASK
 */
'use strict';

var gulp = require('gulp');
var config = require('../gulp.config')();
var $ = require('gulp-load-plugins')({
  lazy: true
});
var args = require('yargs').argv;
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var messageLogger = require('../utils/messageLogger.gulp')();
var runSeq = require('run-sequence');

/*******************************************************************
 * Typescript transpiling task
 * Usage: gulp ts:build      Transpiles all ts files to js
 * Options:
 * --notest             Skips the test (.spec.ts) files
 * --noapp              Skips the app files
 ******************************************************************/
gulp.task('ts:build', function (done) {
  runSeq([
      'ts:build-app',
      'ts:build-test'
    ],
    done);
});

gulp.task('ts:build-test', function () {
  var files = config.testFiles.spec.ts;

  messageLogger('Transpiling TypeScript test files', files);
  return buildts(files, config.tsTestOutputFolder);
});

gulp.task('ts:build-app', function () {
  var files = [].concat(
    config.appFiles.ts,
    '!' + config.testFiles.spec.ts
  );

  messageLogger('Transpiling TypeScript files', files);
  return buildts(files, config.build);
});

function buildts(files, dest) {
  var reporter = $.typescript.reporter.defaultReporter();

  return gulp
    .src(files, {
      base: config.app
    })
    .pipe($.if(args.verbose, $.print()))
    .pipe($.sourcemaps.init())
    .pipe($.typescript({
      "removeComments": false,
      "preserveConstEnums": true,
      "target": "ES5",
      "sourceMap": true,
      "showOutput": "silent",
      "listFiles": false
    }, undefined, reporter))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest(dest))
    .pipe(reload({
      stream: true
    }));
}
