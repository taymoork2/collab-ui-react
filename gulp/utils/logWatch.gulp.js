/**
 * Log Watch utility
 */
'use strict';

var messageLogger = require('./messageLogger.gulp')();
var testFiles;
var changedFiles;

function logWatch(event) {
  messageLogger('*** File ' + event.path + ' was ' + event.type + ', running tasks...');
  var path = event.path;
  var pathArray = path.split('/');
  var appIndex = pathArray.indexOf('modules') + 1;
  var parentIndex = pathArray.length - 1;
  var parentDirectory = pathArray.slice(appIndex, parentIndex).join('/');
  return {
    testFiles: [
      'test/' + parentDirectory + '/**.spec.js',
      'app/**/' + parentDirectory + '/**.spec.js'
    ],
    changedFiles: path
  };
}

module.exports = function () {
  return logWatch;
};
