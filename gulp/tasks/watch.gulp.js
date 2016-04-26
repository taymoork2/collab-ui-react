/**
 * WATCH TASKS
 */
'use strict';

var $ = require('gulp-load-plugins')();
var args = require('yargs').argv;
var browserSync = require('browser-sync');
var config = require('../gulp.config')();
var gulp = require('gulp');
var Server = require('karma').Server;
var log = $.util.log;
var messageLogger = require('../utils/messageLogger.gulp')();
var logWatch = require('../utils/logWatch.gulp')();
var path = require('path');
var reload = browserSync.reload;
var typeScriptUtil = require('../utils/typeScript.gulp.js');
var series = require('stream-series');

var changedFiles;
var testFiles;

gulp.task('watch', [
  'watch:scss',
  'watch:js',
  'watch:ts',
  'watch:vendorjs',
  'watch:templates',
  'watch:lang'
]);

gulp.task('watch:js', function () {
  if (!args.dist) {
    if (args.nounit) {
      gulp.watch([
          config.appFiles.js
        ], [
          'copy:changed-files',
          'index:build'
        ])
        .on('change', karmaModifiedFiles);
    } else {
      gulp.watch([
          config.appFiles.js
        ], [
          'karma-watch',
          'copy:changed-files',
          'index:build'
        ])
        .on('change', karmaModifiedFiles);
    }
  }
});

gulp.task('watch:ts', function () {
  if (!args.dist) {
    if (args.nounit) {
      gulp.watch([
          config.typeScript.appFiles,
          '!' + config.typeScript.testFiles
        ], [
          'ts:changed-files',
          'index:build'
        ])
        .on('change', karmaModifiedFiles);
      gulp.watch(
          [
            '!' + config.typeScript.appFiles,
            config.typeScript.testFiles
          ], ['ts:changed-spec-files', 'index:build'])
        .on('change', karmaModifiedFiles);
    } else {
      gulp.watch([
          config.typeScript.appFiles,
          '!' + config.typeScript.testFiles
        ], [
          'karma-watch',
          'ts:changed-files',
          'index:build'
        ])
        .on('change', karmaModifiedFiles);
      gulp.watch(
          [
            '!' + config.typeScript.appFiles,
            config.typeScript.testFiles
          ], [
            'karma-watch',
            'ts:changed-spec-files',
            'index:build'
          ])
        .on('change', karmaModifiedFiles);
    }
  }
});

gulp.task('watch:lang', function () {
  if (!args.dist) {
    gulp.watch([
        config.appFiles.lang
      ], [
        'copy:changed-files'
      ])
      .on('change', karmaModifiedFiles);
  }
});

gulp.task('watch:vendorjs', function () {
  if (!args.dist) {
    gulp.watch([
        config.vendorFiles.js
      ], [
        'copy:build-vendor-js',
        'index:build'
      ])
      .on('change', karmaModifiedFiles);
  }
});

gulp.task('karma-watch', ['karma-config-watch'], function (done) {
  if (!args.nounit) {
    var server = new Server({
      configFile: path.resolve(__dirname, '../../test/karma-watch.js'),
      singleRun: true
    }, function (result) {
      if (result) {
        // Exit process if we have an error code
        // Avoids having gulp formatError stacktrace
        process.exit(result);
      } else {
        // Otherwise end task like normal
        done();
      }
    });
    server.start();
  } else {
    log($.util.colors.yellow('--nounit **Skipping Karma Config Task'));
    done();
  }
});

// Compile the karma template so that changes
// with the test files of the changed directory
gulp.task('karma-config-watch', function () {
  var unitTestFiles = [].concat(
    config.vendorFiles.js,
    config.testFiles.js,
    config.testFiles.notTs,
    config.testFiles.app,
    config.testFiles.global,
    testFiles
  );

  return gulp
    .src(config.testFiles.karmaTpl)
    .pipe($.inject(
      series(
        gulp.src(unitTestFiles, {
          read: false
        }),
        gulp.src(typeScriptUtil.getTsFilesFromManifest(), {
          read: false
        })
      ), {
        addRootSlash: false,
        starttag: 'files: [',
        endtag: ',',
        transform: function (filepath, file, i, length) {
          return '\'' + filepath + '\'' + (i + 1 < length ? ',' : '');
        }
      }))
    .pipe($.rename({
      basename: 'karma-watch',
      extname: '.js'
    }))
    .pipe(gulp.dest(config.test));
});

gulp.task('copy:changed-files', function () {
  messageLogger('Copying changed files', changedFiles);
  return gulp
    .src(changedFiles.concat(config.appFiles.json), {
      base: config.app
    })
    .pipe($.if(args.verbose, $.print()))
    .pipe(gulp.dest(config.build))
    .pipe(reload({
      stream: true
    }));
});

gulp.task('ts:changed-spec-files', function () {
  return typeScriptUtil.compile([].concat(changedFiles), config.app, false);
});

gulp.task('ts:changed-files', function () {
  return typeScriptUtil.compile([].concat(changedFiles, 'app/scripts/types.ts'), config.build, false);
});

function karmaModifiedFiles(event) {
  var files = logWatch(event);
  changedFiles = files.changedFiles;
  testFiles = files.testFiles;
}
