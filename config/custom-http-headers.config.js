'use strict';

/* eslint-env es6 */

var _ = require('lodash');
var args = require('yargs').argv;

var cspConfig = require(`./csp-${args.env}.config`);
var cspHeaderValue = convertToHeaderValue(cspConfig);
var CustomHttpHeaders = {
  'Content-Security-Policy': cspHeaderValue,
};

function convertToHeaderValue(directives) {
  var directiveEntries = [];

  _.forEach(directives, function (rules, directive) {
    var rulesAsStr = rules.join(' ');
    var directiveEntry = _.kebabCase(directive);
    directiveEntries.push(directiveEntry + ' ' + rulesAsStr);
  });

  return `${directiveEntries.join('; ').concat(';')}`;
}

module.exports = CustomHttpHeaders;
