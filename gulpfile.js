/**
 * MAIN GULP FILE
 */
'use strict';

var gulp = require('gulp');
var taskListing = require('gulp-task-listing');
var requireDir = require('require-dir');

// Tasks are imported from the 'gulp' directory
requireDir('./gulp', {
  recurse: true
});

// Default gulp task
gulp.task('default', ['help']);

// List all of the available gulp tasks
gulp.task('help', taskListing);
