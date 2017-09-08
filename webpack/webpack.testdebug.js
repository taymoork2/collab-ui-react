const merge = require('webpack-merge');
const testWebpack = require('./webpack.test');
const loaders = require('./loaders');
const _ = require('lodash');

function webpackConfig(env) {
  const testWebpackConfig = testWebpack(env);

  _.remove(testWebpackConfig.module.rules, loaders.instrumentJs);
  _.remove(testWebpackConfig.module.rules, loaders.instrumentTs);

  const testDebugConfig = merge.smart(testWebpackConfig, {
    devtool: 'inline-source-map',
  });

  return testDebugConfig;
}

module.exports = webpackConfig;
