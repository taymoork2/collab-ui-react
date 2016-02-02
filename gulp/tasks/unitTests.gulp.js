/**
 * UNIT TESTING TASKS
 */
'use strict';

/* global __dirname */
var gulp = require('gulp');
var config = require('../gulp.config')();
var $ = require('gulp-load-plugins')({ lazy: true });
var args = require('yargs').argv;
var karma = require('karma').server;
var runSeq = require('run-sequence');
var log = $.util.log;
var path = require('path')

// Compile the karma template so that changes
// to its file array aren't managed manually
gulp.task('karma-config', function (done) {
  if (!args.nounit) {
    var specs = args.specs || 'all';
    var unitTestFiles = [].concat(
      config.vendorFiles.js,
      config.testFiles.js,
      config.testFiles.app,
      config.testFiles.global,
      config.testFiles.spec[specs]
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
        basename: 'karma-unit-' + specs,
        extname: '.js'
      }))
      .pipe($.jsbeautifier({
        config: '.jsbeautifyrc',
        mode: 'VERIFY_AND_WRITE',
        logSuccess: false
      }))
      .pipe(gulp.dest(config.test));
  } else {
    log($.util.colors.red('--nounit **Skipping Karma Config Task'));
    return done();
  }
});



// Run test once and exit
gulp.task('karma', function (done) {
  if (!args.nounit) {
    var specs = args.specs || 'all';
    var options = {
      configFile: path.resolve(__dirname, '../../test/karma-unit-' + specs + '.js')
    };
    if (args.debug) {
      if (args.watch) {
        options.autoWatch = true;
      }
      options.browsers = ['Chrome'];
      options.preprocessors = {};
      options.browserNoActivityTimeout = 600000;
    } else {
      options.singleRun = true;
    }
    karma.start(options, done);
  } else {
    log($.util.colors.red('--nounit **Skipping Karma Tests'));
    return done();
  }
});

// Run test once and exit
gulp.task('karma-watch', function (done) {
  karma.start({
    configFile: path.resolve(__dirname, '../../test/karma-watch.js'),
    singleRun: true
  }, done);
});

gulp.task('karma-core', function (done) {
  args.specs = 'core';
  runSeq('karma-config','karma', done);
});

gulp.task('karma-hercules', function (done) {
  args.specs = 'hercules';
  runSeq('karma-config','karma', done);
});

gulp.task('karma-huron', function (done) {
  args.specs = 'huron';
  runSeq('karma-config','karma', done);
});

gulp.task('karma-mediafusion', function (done) {
  args.specs = 'mediafusion';
  runSeq('karma-config','karma', done);
});

gulp.task('karma-messenger', function (done) {
  args.specs = 'messenger';
  runSeq('karma-config','karma', done);
});

gulp.task('karma-squared', function (done) {
  args.specs = 'squared';
  runSeq('karma-config','karma', done);
});

gulp.task('karma-sunlight', function (done) {
  args.specs = 'sunlight';
  runSeq('karma-config','karma', done);
});

gulp.task('karma-webex', function (done) {
  args.specs = 'webex';
  runSeq('karma-config','karma', done);
});

gulp.task('karma-all', function (done) {
  runSeq(
    'karma-core',
    'karma-hercules',
    'karma-huron',
    'karma-mediafusion',
    'karma-messenger',
    'karma-squared',
    'karma-sunlight',
    'karma-webex',
    done);
});
