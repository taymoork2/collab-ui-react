/**
 * DISTRIBUTION TASKS
 */
'use strict';

var gulp = require('gulp');
var runSeq = require('run-sequence');
var _ = require('lodash');
var args = require('yargs').argv;

// Run tasks for Dist/Production directory
gulp.task('dist', function (done) {
  var distTasks = [
    'build', [
      'image-min',
      'optimize',
      'copy:dist'
    ],
    done
  ];
  if (args.nobuild) {
    _.pull(distTasks, 'build');
  }
  runSeq.apply(this, distTasks);
});
