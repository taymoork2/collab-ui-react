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
var log = $.util.log;

// Compile the karma template so that changes
// to its file array aren't managed manually
gulp.task('karma-config', function (done) {
  if (!args.nounit) {
    var unitTestFiles = [].concat(
      config.vendorFiles.js,
      config.testFiles.js,
      config.testFiles.app,
      config.testFiles.global,
      config.testFiles.spec
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
        basename: 'karma-unit',
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
    var dirname = __dirname.split('/');
    var removed = dirname.splice((dirname.length - 2), 2);
    var directory = dirname.join('/');
    var options = {
      configFile: directory + '/test/karma-unit.js'
    };
    if (args.debug) {
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
gulp.task('karma-watch', ['karma-config-watch'], function (done) {
  var dirname = __dirname.split('/');
  var removed = dirname.splice((dirname.length - 2), 2);
  var directory = dirname.join('/');
  karma.start({
    configFile: directory + '/test/karma-watch.js',
    singleRun: true
  }, done);
});
