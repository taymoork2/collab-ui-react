/**
 * GRUNT ALIASES
 */
'use strict';

var gulp = require('gulp');
var util = require('gulp-util');
var log = util.log;
var colors = util.colors;
var runSeq = require('run-sequence');

gulp.task('jsb', function (done) {
  runSeq(
    'jsBeautifier:beautify',
    'analyze:jshint',
    done
  );
});

gulp.task('jsb:verify', function (done) {
  runSeq(
    'jsBeautifier:verify',
    'analyze:jshint',
    done
  );
});

gulp.task('compile', function () {
  log(colors.yellow('*************************************'));
  log(colors.yellow('* The `compile` task is depreciated. '));
  log(colors.green('* Use `gulp dist` instead.'));
  log(colors.yellow('*************************************'));
  gulp.start('dist');
});

gulp.task('server', function () {
  log(colors.yellow('***************************************'));
  log(colors.red('* The `server` task has been deprecated.'));
  log(colors.green('* Use `gulp serve` to start a server.'));
  log(colors.yellow('**************************************'));
  gulp.start('serve');
});

gulp.task('test', function () {
  log(colors.yellow('*****************************************'));
  log(colors.red('* The `test` task has been deprecated.'));
  log(colors.green('* Use `gulp e2e` to run functional tests.'));
  log(colors.yellow('*****************************************'));
  gulp.start('e2e');
});
