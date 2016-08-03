const webpack = require('webpack');
const merge = require('webpack-merge');
const commonWebpack = require('./webpack.common');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const loaders = require('./loaders');
const _ = require('lodash');

const prodWebpack = merge.smart(commonWebpack, {
  devtool: false,
  module: {
    loaders: [_.merge(loaders.scss, {
      loader: ExtractTextPlugin.extract('style', 'css?sourceMap!postcss!sass'),
    })],
  },
  output: {
    publicPath: '/',
    filename: 'js/[name].[hash].js',
    chunkFilename: 'js/[name].[hash].js',
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'index.html',
      inject: 'body',
    }),
    new ExtractTextPlugin('styles/[name].[hash].css'),
    new webpack.NoErrorsPlugin(),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin({
      mangle: false,
    }),
  ],
});

module.exports = prodWebpack;
