const merge = require('webpack-merge');
const commonWebpack = require('./webpack.common');
const loaders = require('./loaders');
const _ = require('lodash');

const testConfig = merge.smart(commonWebpack, {
  devtool: 'inline-source-map',
  entry: {},
  module: {
    preLoaders: [],
    loaders: [_.merge(loaders.scss, {
      loader: 'null',
    })],
    postLoaders: [
      loaders.instrument,
    ],
  },
  output: {},
});

module.exports = testConfig;
