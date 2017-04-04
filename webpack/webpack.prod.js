const webpack = require('webpack');
const merge = require('webpack-merge');
const commonWebpack = require('./webpack.common');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const loaders = require('./loaders');
const plugins = require('./plugins');
const _ = require('lodash');
const sortOrder = require('../utils/sortOrder');

function webpackConfig(env) {
  const commonWebpackConfig = commonWebpack(env);
  // TODO: overriding sass loader config via 'merge.smart' doesn't work as expected
  // - for now, we override here as a pre-step before the merge operation
  function patchScssLoader(conf) {
    const scssLoaderRule = _.find(conf.module.rules, loaders.scss);
    // removes 'style-loader'
    const scssLoaders = _.tail(scssLoaderRule.use);
    const cssLoader = _.find(scssLoaders, {
      loader: 'css-loader',
    });
    // minimize css for dist output
    _.set(cssLoader, 'options.minimize', true);
    // replace current loaders with ExtractTextPlugin
    scssLoaderRule.use = ExtractTextPlugin.extract({
      fallbackLoader: 'style-loader',
      loader: scssLoaders,
    });
  }
  patchScssLoader(commonWebpackConfig);

  const prodWebpack = merge.smart(commonWebpackConfig, {
    devtool: false,
    output: {
      publicPath: '/',
      filename: 'js/[name].[hash].js',
      chunkFilename: 'js/[name].[hash].js',
    },
    plugins: plugins.commonsChunkPlugins.concat([
      new HtmlWebpackPlugin({
        template: 'index.html',
        inject: 'body',
        ngStrictDi: '',
        loadAdobeScripts: true,
        chunksSortMode: sortOrder,
      }),
      new ExtractTextPlugin({
        filename: 'styles/[name].[hash].css',
        allChunks: true,
      }),
      new webpack.NoEmitOnErrorsPlugin(),
      new webpack.optimize.UglifyJsPlugin({
        mangle: false,
      }),
    ]),
    stats: {
      children: false, // hide output from children plugins
    },
  });

  return prodWebpack;
}

module.exports = webpackConfig;
