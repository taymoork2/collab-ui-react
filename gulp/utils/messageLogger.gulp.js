/**
 * Message logger utility
 */
'use strict';

var args = require('yargs').argv;
var util = require('gulp-util');
var log = util.log;
var colors = util.colors;

function messageLogger(message, files) {
  if (args.verbose && files) {
    log(message + ': ' + colors.green(files));
  } else {
    log(colors.green(message));
  }
}

module.exports = function () {
  return messageLogger;
};
