const merge = require('webpack-merge');
const testWebpackConfig = require('./webpack.test');

const testDebugConfig = merge.smart(testWebpackConfig, {
  module: {
    postLoaders: [],
  },
});

module.exports = testDebugConfig;
