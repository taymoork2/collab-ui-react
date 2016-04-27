/**
 * TypeScript utility
 */
'use strict';

/* eslint no-param-reassign:0 */

var gulp = require('gulp');
var fileListParser = require('./fileListParser.gulp');
var config = require('../gulp.config')();
var $ = require('gulp-load-plugins')({
  lazy: true
});
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var args = require('yargs').argv;

function compile(files, dest, writeManifest) {
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
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest(dest))
    .pipe($.if(writeManifest, $.concatFilenames(config.tsManifest)))
    .pipe($.if(writeManifest, gulp.dest(dest)))
    .pipe(reload({
      stream: true
    }));
}

function getTsFilesFromManifest() {
  var fileList = [];
  fileList = fileList.concat(fileListParser.toList(config.build + '/' + config.tsManifest, "utf8"));
  return fileList;
}

module.exports = {
  compile: compile,
  getTsFilesFromManifest: getTsFilesFromManifest
};
