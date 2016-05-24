/**
 * TypeScript utility
 */
'use strict';

/* eslint no-param-reassign:0 */

var gulp = require('gulp');
var fileListParser = require('./fileListParser.gulp');
var config = require('../gulp.config')();
var lazypipe = require('lazypipe');
var $ = require('gulp-load-plugins')({
  lazy: true
});
var messageLogger = require('../utils/messageLogger.gulp')();
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var args = require('yargs').argv;

function compile(files, dest, writeManifestTo) {
  var reporter = $.typescript.reporter.defaultReporter();
  var SPEC_SUFFIX = '.spec';

  var writeManifest;
  if (!!writeManifestTo) {
    writeManifest = lazypipe()
      .pipe($.concatFilenames, writeManifestTo)
      .pipe(gulp.dest, dest);
  } else {
    writeManifest = lazypipe().pipe($.util.noop);
  }

  return gulp
    .src(files, {
      base: config.app
    })
    .pipe($.if(args.verbose, $.print()))
    .pipe($.sourcemaps.init())
    .pipe($.typescript({
      removeComments: false,
      preserveConstEnums: true,
      target: 'ES5',
      sourceMap: true,
      listFiles: false,
      sortOutput: true
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
    .pipe($.if(!!writeManifestTo, writeManifest()))
    .pipe(reload({
      stream: true
    }));
}

function getTsFilesFromManifest(manifest) {
  var fileList = [];
  fileList = fileList.concat(fileListParser.toList(config.build + '/' + manifest, "utf8"));
  return fileList;
}

module.exports = {
  compile: compile,
  getTsFilesFromManifest: getTsFilesFromManifest
};
