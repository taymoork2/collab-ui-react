'use strict';

var e2e = 'test/e2e-protractor';
var cache = '.cache';

var config = {
  cache: cache,
  e2eFailRetry: '.e2e-fail-retry',
  e2eFailRetrySpecLists: cache + '/e2e-fail-retry-run-*',
  e2eReports: e2e + '/reports',
  e2eSuites: {
    hercules: e2e + '/hercules/**/*_spec.js',
    huron: e2e + '/huron/**/*_spec.js',
    mediafusion: e2e + '/mediafusion/**/*_spec.js',
    squared: e2e + '/squared/**/*_spec.js',
    webex: e2e + '/webex/**/*_spec.js',
    sunlight: e2e + '/sunlight/**/*_spec.js',
  },
};

module.exports = config;
