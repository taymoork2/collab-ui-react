/**
 * TEMPLATE CACHING TASK
 */
'use strict';

var gulp = require('gulp');
var config = require('../gulp.config')();
var $ = require('gulp-load-plugins')();
var args = require('yargs').argv;
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var messageLogger = require('../utils/messageLogger.gulp')();
var runSeq = require('run-sequence');
var typeScriptUtil = require('../utils/typeScript.gulp.js');

/*******************************************************************
 * Typescript transpiling task
 * Usage: gulp ts:build      Transpiles all ts files to js
 * Options:
 * --notest             Skips the test (.spec.ts) files
 * --noapp              Skips the app files
 ******************************************************************/
gulp.task('ts:build', ['tsd'], function (done) {
  runSeq([
      'ts:build-app',
      'ts:build-test'
    ],
    done);
});

gulp.task('ts:build-test', function () {
  var files = config.typeScript.testFiles;

  messageLogger('Transpiling TypeScript test files', files);
  return typeScriptUtil.compile(files, config.app, false,false);
});

gulp.task('ts:build-app', function () {
  var files = [].concat(
    config.typeScript.appFiles,
    '!' + config.typeScript.testFiles
  );

  messageLogger('Transpiling TypeScript files', files);
  return typeScriptUtil.compile(files, config.build, true, true);
});
