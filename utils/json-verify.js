var fs = require('fs-extra');
var glob = require('glob');
var _ = require('lodash');

verifyJsonFiles();

function verifyJsonFiles() {
  glob('./app/**/*.json', {}, readJsonFiles);
  glob('./test/**/*.json', {}, readJsonFiles);
}

function readJsonFiles(err, files) {
  if (err) {
    throw new Error('Error finding json files: ', + err);
  }
  _.forEach(files, function (jsonFile) {
    fs.readJsonSync(jsonFile);
  });
}
