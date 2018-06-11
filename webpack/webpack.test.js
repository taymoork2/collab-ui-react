const webpack = require('webpack');
const merge = require('webpack-merge');
const commonWebpack = require('./webpack.common');
const loaders = require('./loaders');
const _ = require('lodash');

function webpackConfig(env) {
  const commonWebpackConfig = commonWebpack(env);

  // option to opt-in to lint in test env
  if (env.lint) {
    commonWebpackConfig.module.rules.push(loaders.eslint);
    commonWebpackConfig.module.rules.push(loaders.tslint);
  }

  // include instrumentation loader
  if (env.coverage) {
    commonWebpackConfig.module.rules.push(loaders.instrumentJs);
    commonWebpackConfig.module.rules.push(loaders.instrumentTs);
  }

  const tsLoaderRule = _.find(commonWebpackConfig.module.rules, loaders.ts);
  const tsLoader = _.find(tsLoaderRule.use, {
    use: 'awesome-typescript-loader',
  });
  // TODO: karma stack trace is showing transpiled line reference instead of source
  // Inline source maps needed for code coverage and debugging
  _.set(tsLoader, 'options.sourceMap', false);
  _.set(tsLoader, 'options.inlineSourceMap', true);

  const testConfig = merge.smart(commonWebpackConfig, {
    devtool: 'inline-source-map',
    plugins: [
      new webpack.NormalModuleReplacementPlugin(/\.(svg|png|jpg|jpeg|gif|ico|scss|css|woff|woff2|ttf|eot|pdf)$/, 'node-noop'),
    ],
  });
  // replace `output` with empty object
  testConfig.output = {};
  // remove `entry` for karma-webpack
  delete testConfig.entry;

  return testConfig;
}

module.exports = webpackConfig;
