const merge = require('webpack-merge');
const commonWebpack = require('./webpack.common');
const loaders = require('./loaders');
const _ = require('lodash');

function webpackConfig(env) {
  const commonWebpackConfig = commonWebpack(env);

  // include instrumentation loader
  commonWebpackConfig.module.rules.push(loaders.instrument);

  const tsLoaderRule = _.find(commonWebpackConfig.module.rules, loaders.ts);
  const tsLoader = _.find(tsLoaderRule.use, {
    loader: 'ts-loader',
  });
  // set inline source maps for code coverage and debugging
  _.set(tsLoader, 'options.compilerOptions.sourceMap', false);
  _.set(tsLoader, 'options.compilerOptions.inlineSourceMap', true);

  const scssLoaderRule = _.find(commonWebpackConfig.module.rules, loaders.scss);
  scssLoaderRule.use = 'null-loader';

  const testConfig = merge.smart(commonWebpackConfig, {
    // ideally faster build speed
    devtool: 'cheap-inline-source-map',
    output: {},
  });

  // remove `entry` for karma-webpack
  delete testConfig.entry;

  return testConfig;
}

module.exports = webpackConfig;
