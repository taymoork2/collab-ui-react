var fs = require('fs-extra');
var glob = require('glob');
var _ = require('lodash');

deleteTsSpecFiles();

function deleteTsSpecFiles() {
  glob('./app/**/*.spec.ts.js', {}, deleteFiles);
  glob('./app/**/*.ts.spec.js', {}, deleteFiles);
}

function deleteFiles(err, files) {
  if (err) {
    throw new Error('Error finding files: ', +err);
  }
  _.forEach(files, fs.removeSync);
}
