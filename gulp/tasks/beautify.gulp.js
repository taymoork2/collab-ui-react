/**
 * JAVASCRIPT BEAUTIFYING TASKS
 */
'use strict';

var gulp = require('gulp');
var config = require('../gulp.config')();
var args = require('yargs').argv;
var jsbeautifier = require('gulp-jsbeautifier');
var messageLogger = require('../utils/messageLogger.gulp')();

// Ensure code styles are up to par and there
// are no obvious mistakes
gulp.task('jsBeautifier:verify', function () {
  var logSuccess = args.verbose ? true : false;
  messageLogger('Verifying JS files formatting', config.beautifyFiles);
  return gulp
    .src(config.beautifyFiles)
    .pipe(jsbeautifier({
      config: '.jsbeautifyrc',
      mode: 'VERIFY_ONLY',
      logSuccess: logSuccess
    }));
});

gulp.task('jsBeautifier:beautify', function () {
  var logSuccess = args.verbose ? true : false;
  messageLogger('Formatting JS files', config.beautifyFiles);
  return gulp
    .src(config.beautifyFiles, {
      base: './'
    })
    .pipe(jsbeautifier({
      config: '.jsbeautifyrc',
      mode: 'VERIFY_AND_WRITE',
      logSuccess: logSuccess
    }))
    .pipe(gulp.dest('./'));
});
