'use strict';

var gutil = require('gulp-util');
var semver = require('semver');

// Check requirements
if (!semver.satisfies(process.version, '>=4')) {
  gutil.log(gutil.colors.red('NodeJS version should be at least version 4, current is:'), gutil.colors.red.bold(process.version));
  gutil.log(gutil.colors.red('Consider using nvm: https://github.com/creationix/nvm'));
  process.exit(1);
}
var spawn = require('child_process').spawnSync;
var child = spawn('npm', ['--version']);
var npmVersion = child.stdout.toString();
if (child.status !== 0 || !semver.satisfies(npmVersion, '=2')) {
  gutil.log(gutil.colors.red('npm version should strictly be version 2, current is:'), gutil.colors.red.bold(npmVersion));
  gutil.log(gutil.colors.red('`npm install -g npm@latest-2` may do the trick'));
  process.exit(1);
}

// Gulpfile.js

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
