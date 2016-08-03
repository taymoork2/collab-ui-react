const webpack = require('webpack');
const merge = require('webpack-merge');
const commonWebpack = require('./webpack.common');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const hotMiddlewareScript = 'webpack-hot-middleware/client?timeout=30000';

const devWebpack = merge.smart(commonWebpack, {
  entry: {
    styles: [hotMiddlewareScript],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'index.html',
      inject: 'body',
    }),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
  ],
});

module.exports = devWebpack;
