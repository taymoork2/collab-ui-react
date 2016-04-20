/**
 * CLEANING TASKS
 */
'use strict';

var gulp = require('gulp');
var config = require('../gulp.config')();
var messageLogger = require('../utils/messageLogger.gulp')();
var del = require('del');

// Delete build and dist directory files
gulp.task('clean', ['clean:build', 'clean:coverage', 'clean:dist', 'clean:karma', 'clean:test', 'clean:ts']);

// Delete dist directory files
gulp.task('clean:dist', function () {
  var files = config.dist;
  messageLogger('Cleaning dist directory', files);
  return del(files);
});

// Delete build directory files
gulp.task('clean:build', function () {
  var files = [
    config.build
  ];
  messageLogger('Cleaning build directory', files);
  return del(files);
});

// Delete coverage directory files
gulp.task('clean:coverage', function () {
  var files = [
    config.coverage
  ];
  messageLogger('Cleaning coverage directory', files);
  return del(files);
});

// Delete karma directory files
gulp.task('clean:karma', function () {
  var files = config.test + '/karma*.js';
  messageLogger('Cleaning karma files', files);
  return del(files);
});

// Delete files from individual build sub-directories
gulp.task('clean:css', function () {
  var files = [
    config.build + '/styles/**/*.css',
    config.build + '/styles/**/*.css.map'
  ];
  messageLogger('Cleaning CSS files', files);
  return del(files);
});

// Delete test results files
gulp.task('clean:test', function () {
  var files = [
    config.e2e + '/reports/*.xml'
  ];
  messageLogger('Cleaning test results', files);
  return del(files);
});

gulp.task('clean:ts', function () {
  var files = [
    config.typeScript.compiledTestFiles
  ];
  messageLogger('Cleaning TypeScript compiled tests', files);
  return del(files);
});
