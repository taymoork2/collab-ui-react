/**
 * CLEANING TASKS
 */
'use strict';

var gulp = require('gulp');
var config = require('../gulp.config')();
var messageLogger = require('../utils/messageLogger.gulp')();
var del = require('del');

// Delete build and dist directory files
gulp.task('clean', ['clean:build', 'clean:dist', 'clean:karma','clean:test']);

// Delete dist directory files
gulp.task('clean:dist', function (done) {
  var files = config.dist;
  messageLogger('Cleaning dist directory', files);
  del(files, done);
});

// Delete build directory files
gulp.task('clean:build', function (done) {
  var files = [
    config.build,
    config.tstests
  ];
  messageLogger('Cleaning build directory', files);
  del(files, done);
});

// Delete karma directory files
gulp.task('clean:karma', function (done) {
  var files = config.test + '/karma*.js';
  messageLogger('Cleaning karma files', files);
  del(files, done);
});

// Delete files from individual build sub-directories
gulp.task('clean:css', function (done) {
  var files = [
    config.build + 'styles/**/*.css'
  ];
  messageLogger('Cleaning CSS files', files);
  del(files, done);
});

// Delete test results files
gulp.task('clean:test', function (done) {
  var files = [
    config.e2e + '/reports/*.xml'
  ];
  messageLogger('Cleaning test results', files);
  del(files, done);
});
