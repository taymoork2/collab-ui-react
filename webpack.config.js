'use strict';

var webpackConfig;
switch (process.env.npm_lifecycle_event) {
  case 'build':
    webpackConfig = require('./webpack/webpack.prod');
    break;
  case 'test':
  case 'ktest-all':
  case 'ktest-all-no-parallel':
  case 'ktest-all-watch':
  case 'ktest-watch':
    webpackConfig = require('./webpack/webpack.test');
    break;
  case 'ktest-debug':
    webpackConfig = require('./webpack/webpack.testdebug');
    break;
  default:
    webpackConfig = require('./webpack/webpack.dev');
}

module.exports = webpackConfig;
