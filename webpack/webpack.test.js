const webpack = require('webpack');
const merge = require('webpack-merge');
const commonWebpack = require('./webpack.common');
const loaders = require('./loaders');

const testConfig = merge.smart(commonWebpack, {
  // ideally faster build speed
  devtool: 'cheap-inline-source-map',
  entry: {},
  module: {
    postLoaders: [
      loaders.instrument,
    ],
  },
  ts: {
    compilerOptions: {
      sourceMap: false,
      inlineSourceMap: true,
    },
  },
  output: {},
  plugins: [
    // don't load unnecessary files
    new webpack.NormalModuleReplacementPlugin(/\.(svg|png|jpg|jpeg|gif|ico|scss|css|woff|woff2|ttf|eot|pdf)$/, 'node-noop'),
  ],
});

module.exports = testConfig;
