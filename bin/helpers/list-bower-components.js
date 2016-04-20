#!/usr/bin/env node

var glob = require('glob');
var _ = require('lodash');
var fs = require('fs');
var sprintf = require('sprintf-js').sprintf;

glob('bower_components/*/bower.json', {}, function (er, files) {
  _.forEach(files, function (file) {
    var bower = JSON.parse(fs.readFileSync(file));
    console.log(sprintf('%-50s %-15s %-80s', bower.name, bower.version, file));
  });
});
