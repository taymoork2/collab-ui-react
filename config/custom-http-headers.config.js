'use strict';

/* eslint-env es6 */

var _ = require('lodash');
var helmetCspConfig = require('./csp-prod.config');
var cspHeaderValue = convertToHeaderValue(helmetCspConfig);
var customHttpHeaders = {
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

module.exports = customHttpHeaders;
