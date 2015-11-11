/**
 * DISTRIBUTION TASKS
 */
'use strict';

var gulp = require('gulp');
var runSeq = require('run-sequence');

// Run tasks for Dist/Production directory
gulp.task('dist', ['build'], function (done) {
  runSeq(
    [
      'image-min',
      'optimize',
      'copy:dist'
    ],
    done
  );
});
