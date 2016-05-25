/**
 * SECURITY ANALYSIS TASKS
 */
'use strict';

var gulp = require('gulp');
var config = require('../gulp.config')();
var $ = require('gulp-load-plugins')({
  lazy: true
});
var args = require('yargs').argv;
var exec = require('child_process').exec;

var retire = '$(npm bin)/retire';
var path = '--path bower_components';
var output = '--outputpath $WX2_ADMIN_WEB_CLIENT_HOME/.cache/retirejs-results-for-$BUILD_TAG';
var stdOut = [retire, path].join(' ');
var fileOut = [retire, path, output].join(' ');

gulp.task('retire', function () {
  // TODO: change this to use processEnvUtil.isJenkins() once available
  var command = args.jenkins ? fileOut : stdOut;
  var child = exec(command, {
    cwd: process.cwd()
  });

  child.stdout.setEncoding('utf8');
  child.stdout.on('data', function (data) {
    $.util.log(data);
  });

  child.stderr.setEncoding('utf8');
  child.stderr.on('data', function (data) {
    $.util.log($.util.colors.red(data));
  });
});
