/**
 * BUILD TASKS
 */
'use strict';

var gulp = require('gulp');
var args = require('yargs').argv;
var runSeq = require('run-sequence');

// Run tasks for Build/Development directory
gulp.task('build', ['clean'], function (done) {
  var tasks = [];
  var runInParallel = [
        'template-cache',
        'scss:build',
        'copy:build',
        'ts:build'
      ];
  if(!args.nolint){
    tasks.push('jsb');
  }
  tasks.push(runInParallel);
  tasks.push('processHtml:build');

  if(args.karmaSplit){
    tasks.push('karma-all');
  } else {
    tasks.push('karma-config');
    tasks.push('karma');
  }
  tasks.push(done);

  runSeq.apply(this,tasks);
});
