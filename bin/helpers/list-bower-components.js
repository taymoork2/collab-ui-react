#!/usr/bin/env node

var glob = require('glob');
var _ = require('lodash');
var fs = require('fs');

glob('bower_components/**/bower.json', {}, function (er, files) {
  _.forEach(files, function (file) {
    var bower = JSON.parse(fs.readFileSync(file));
    console.log(bower.name, bower.version);
  });
});
