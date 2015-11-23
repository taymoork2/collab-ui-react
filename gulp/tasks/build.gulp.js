/**
 * BUILD TASKS
 */
'use strict';

var gulp = require('gulp');
var args = require('yargs').argv;
var runSeq = require('run-sequence');

// Run tasks for Build/Development directory
gulp.task('build', ['clean'], function (done) {
  if (args.nolint) {
    runSeq(
      [
        'template-cache',
        'scss:build',
        'copy:build',
        'ts:build'
      ],
      'processHtml:build',
      'karma-config',
      'karma',
      done
    );
  } else {
    runSeq(
      'jsb', [
        'template-cache',
        'scss:build',
        'copy:build',
        'ts:build'
      ],
      'processHtml:build',
      'karma-config',
      'karma',
      done
    );
  }
});
