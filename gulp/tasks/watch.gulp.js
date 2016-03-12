/**
 * WATCH TASKS
 */
'use strict';

var $ = require('gulp-load-plugins')({lazy: true});
var args = require('yargs').argv;
var browserSync = require('browser-sync');
var config = require('../gulp.config')();
var gulp = require('gulp');
var karma = require('karma').server;
var log = $.util.log;
var messageLogger = require('../utils/messageLogger.gulp')();
var logWatch = require('../utils/logWatch.gulp')();
var path = require('path');
var reload = browserSync.reload;

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
        .on('change', logWatch);
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
          config.appFiles.ts,
          '!' + config.testFiles.spec.ts
        ], [
          'ts:changed-files',
          'index:build'
        ])
        .on('change', karmaModifiedFiles);
      gulp.watch(
        [
          '!' + config.appFiles.ts,
          config.testFiles.spec.ts],
        ['ts:changed-spec-files', 'index:build'])
        .on('change', karmaModifiedFiles);
    } else {
      gulp.watch([
          config.appFiles.ts,
          '!' + config.testFiles.spec.ts
        ], [
          'karma-watch',
          'ts:changed-files',
          'index:build'
        ])
        .on('change', karmaModifiedFiles);
      gulp.watch(
        [
          '!' + config.appFiles.ts,
          config.testFiles.spec.ts],
        [
          'karma-watch',
          'ts:changed-spec-files',
          'index:build'])
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

gulp.task('karma-watch',['karma-config-watch'], function (done) {
  karma.start({
    configFile: path.resolve(__dirname, '../../test/karma-watch.js'),
    singleRun: true
  }, done);
});

// Compile the karma template so that changes
// with the test files of the changed directory
gulp.task('karma-config-watch', function () {
  var unitTestFiles = [].concat(
    config.vendorFiles.js,
    config.testFiles.js,
    config.testFiles.app,
    config.testFiles.global,
    testFiles
  );

  return gulp
    .src(config.testFiles.karmaTpl)
    .pipe($.inject(gulp.src(unitTestFiles, {
      read: false
    }), {
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
    .src(changedFiles, {
      base: config.app
    })
    .pipe($.if(args.verbose, $.print()))
    .pipe(gulp.dest(config.build))
    .pipe(reload({
      stream: true
    }));
});

gulp.task('ts:changed-spec-files', function () {
  return compileTs([].concat(changedFiles, 'app/scripts/types.ts'), config.tsTestOutputFolder);
});

gulp.task('ts:changed-files', function () {
  return compileTs([].concat(changedFiles, 'app/scripts/types.ts'), config.build);
});

function compileTs(files, output) {
  var filter;
  var reporter = $.typescript.reporter.defaultReporter();
  messageLogger('Transpiling changed TypeScript files', changedFiles);
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
    .pipe(gulp.dest(output))
    .pipe(reload({
      stream: true
    }));
}

function karmaModifiedFiles(event) {
  var files = logWatch(event);
  changedFiles = files.changedFiles;
  testFiles = files.testFiles;
}
