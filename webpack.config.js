'use strict';

function webpackConfig(_env) {
  var env = _env || {};
  var config;
  switch (process.env.npm_lifecycle_event) {
    case 'build':
    case 'stats':
      config = require('./webpack/webpack.prod')(env);
      break;
    case 'test':
    case 'ktest-all':
    case 'ktest-all-no-parallel':
    case 'ktest-all-watch':
    case 'ktest-watch':
      config = require('./webpack/webpack.test')(env);
      break;
    case 'ktest-debug':
      config = require('./webpack/webpack.testdebug')(env);
      break;
    default:
      config = require('./webpack/webpack.dev')(env);
  }
  return config;
}

module.exports = webpackConfig;
