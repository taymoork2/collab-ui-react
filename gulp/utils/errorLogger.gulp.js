/**
 * Error logger utility
 */
'use strict';

var args = require('yargs').argv;
var util = require('gulp-util');
var log = util.log;
var colors = util.colors;
var $ = require('gulp-load-plugins')({
  lazy: true
});

function errorLogger(error) {
  log($.util.colors.red('*** Start of Error ***'));
  log(error);
  log($.util.colors.red('*** End of Error ***'));
  this.emit('end');
}

module.exports = function () {
  return errorLogger;
};
