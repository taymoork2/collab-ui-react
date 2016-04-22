/**
 * TypeScript utility
 */
'use strict';

/* eslint no-param-reassign:0 */

var gulp = require('gulp');
var concat = require('gulp-concat');
var concatFilenames = require('gulp-concat-filenames');
var config = require('../gulp.config')();
var $ = require('gulp-load-plugins')({
  lazy: true
});
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var args = require('yargs').argv;

function compile(files, dest, concatOut, writeManifest) {
  var reporter = $.typescript.reporter.defaultReporter();
  var SPEC_SUFFIX = '.spec';
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
      "listFiles": false,
      "sortOutput": true
    }, undefined, reporter))
    .pipe($.rename(
      function (path) {
        if (path.basename.indexOf(SPEC_SUFFIX) > -1) {
          path.basename = path.basename.replace(SPEC_SUFFIX, '');
          path.extname = config.typeScript.compiledTestSuffix;
        } else {
          path.extname = config.typeScript.compiledSuffix;
        }
      }
    ))
    // .pipe($.print())
    // .pipe(concatFilenames((concatOut?'':'spec-')+'ts-manifest.txt'
    //,
    // {
    // root:'/app',
    // outDir:'build'}
    // ))
    // .pipe($.if(concatOut, concat('modules/core/ts-output.js')))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest(dest))
    .pipe($.if(writeManifest,concatFilenames((concatOut ? '' : 'spec-') + 'ts-manifest.txt')))
    .pipe($.if(writeManifest,gulp.dest(dest)))
    .pipe(reload({
        stream: true
      })
    );
}

module.exports = {
  compile: compile
};
