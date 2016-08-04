var protractorLauncher = require('protractor/built/launcher');
var fileListParser = require('../utils/fileListParser');
var args = require('yargs').argv;
var _ = require('lodash');
var path = require('path');

runProtractor();

function runProtractor() {
  if (args.filesFrom) {
    try {
      args.specs = fileListParser.toList(args.filesFrom);
      delete args.suite; // if running a suite previously
    } catch (err) {
      console.log('Failed to read tests from file', args.filesFrom);
    }
  }
  if (_.isString(args.specs)) {
    args.specs = processFilePatterns_(args.specs);
  }
  protractorLauncher.init('./protractor-config.js', args);
}

function processFilePatterns_(list) {
  return list.split(',').map(function (spec) {
    return path.resolve(process.cwd(), spec);
  });
}
