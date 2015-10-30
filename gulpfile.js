'use strict';

/* global __dirname */
var gulp = require('gulp');
var $ = require('gulp-load-plugins')({
  lazy: true
});
var requireDir = require('require-dir');
var args = require('yargs').argv;
var runSeq = require('run-sequence');
var testFiles = [];
var changedFiles = [];

requireDir('./gulp', {
  recurse: true
});

/**
 * GULP MAIN TASKS
 */

// Default gulp task
gulp.task('default', ['help']);

// List all of the available gulp tasks
gulp.task('help', $.taskListing);

// Run tasks for Build/Development directory
gulp.task('build', ['clean'], function (done) {
  if (args.nolint) {
    runSeq(
      [
        'template-cache',
        'scss:build',
        'copy:build'
      ],
      'processHtml:build',
      'karma-config',
      'karma',
      done
    );
  } else {
    runSeq(
      [
        'jsb',
        'template-cache',
        'scss:build',
        'copy:build'
      ],
      'processHtml:build',
      'karma-config',
      'karma',
      done
    );
  }
});

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
