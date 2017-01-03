const merge = require('webpack-merge');
const testWebpackConfig = require('./webpack.test');

const testDebugConfig = merge.smart(testWebpackConfig, {
  devtool: 'inline-source-map',
  module: {
    postLoaders: [],
  },
});

module.exports = testDebugConfig;
