/**
 * Installs configured TypeScript definitions
 */
'use strict';

var gulp = require('gulp');
var config = require('../gulp.config')();
var del = require('del');
var messageLogger = require('../utils/messageLogger.gulp')();
var runSeq = require('run-sequence');
var tsd = require('gulp-tsd');

gulp.task('tsd', function (done) {
  runSeq(
    'clean:tsd', [
      'tsd:app',
      'tsd:testing'
    ],
    done
  );
});

gulp.task('clean:tsd', function () {
  var files = ['typings'];
  messageLogger('Cleaning typings directory', files);
  return del(files);
});

gulp.task('tsd:app', function (done) {
  tsd({
    command: 'reinstall',
    config: './config/tsd.json'
  }, done);
});

gulp.task('tsd:testing', function (done) {
  tsd({
    command: 'reinstall',
    config: './config/tsd-testing.json'
  }, done);
});
