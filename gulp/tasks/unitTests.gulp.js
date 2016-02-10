/**
 * UNIT TESTING TASKS
 */
'use strict';

/* global __dirname */
var gulp = require('gulp');
var config = require('../gulp.config')();
var fileListParser = require('../utils/fileListParser.gulp');
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
      config.testFiles.global
      );

    // any other 'specs' target should already be defined in 'gulp.config.js'
    if (specs !== 'custom') {
      unitTestFiles = unitTestFiles.concat(config.testFiles.spec[specs]);
    } else {
      // for the 'custom' target, a '--files-from' option MUST be specified as a line-separated list of
      // files relative to the project root dir
      // (see: https://sqbu-github.cisco.com/WebExSquared/wx2-admin-web-client/wiki/About-Karma-Test-Selection#selecting-tests-by-custom-list-ie-gulp-karma-custom---files-from)
      var filesFrom = args['files-from'];
      var flist;
      if (!filesFrom) {
        log($.util.colors.red('Error: missing \'--files-from\' argument'));
        process.exit(1);
      } else {
        // parse each line item from file specified by '--files-from', and append to main list
        flist = fileListParser.toList(filesFrom);
        unitTestFiles = unitTestFiles.concat(flist);
      }
    }

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
    log($.util.colors.yellow('--nounit **Skipping Karma Config Task'));
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
    if (args.watch) {
      options.autoWatch = true;
      options.singleRun = false;
    } else {
      if (args.debug) {
        options.browsers = ['Chrome'];
        options.preprocessors = {};
        options.browserNoActivityTimeout = 600000;
      } else {
        options.singleRun = true;
      }
    }
    karma.start(options, done);
  } else {
    log($.util.colors.yellow('--nounit **Skipping Karma Tests'));
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

gulp.task('karma-custom', function (done) {
  args.specs = 'custom';
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
