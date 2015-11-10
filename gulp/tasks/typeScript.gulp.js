/**
 * TEMPLATE CACHING TASK
 */
'use strict';

var gulp = require('gulp');
var config = require('../gulp.config')();
var $ = require('gulp-load-plugins')({ lazy: true });
var args = require('yargs').argv;
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var messageLogger = require('../utils/messageLogger.gulp')();

gulp.task('ts:build', function () {
  var files = config.appFiles.ts;
  var filter;
  var reporter = $.typescript.reporter.defaultReporter();
  messageLogger('Transpiling TypeScript files', config.appFiles.ts);
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
    }, filter, reporter))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest(config.build))
    .pipe(reload({
      stream: true
    }));
});

