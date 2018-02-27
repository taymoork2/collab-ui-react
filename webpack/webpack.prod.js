const webpack = require('webpack');
const merge = require('webpack-merge');
const commonWebpack = require('./webpack.common');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const loaders = require('./loaders');
const plugins = require('./plugins');
const _ = require('lodash');

function webpackConfig(env) {
  const commonWebpackConfig = commonWebpack(env);
  // TODO: overriding sass loader config via 'merge.smart' doesn't work as expected
  // - for now, we override here as a pre-step before the merge operation
  function patchScssLoader(conf) {
    const scssLoaderRule = _.find(conf.module.rules, loaders.scss);
    // removes 'style-loader'
    const scssLoaders = _.reject(scssLoaderRule.use, {
      loader: 'style-loader',
    });
    const cssLoader = _.find(scssLoaders, {
      use: 'css-loader',
    });
    // minimize css for dist output
    _.set(cssLoader, 'options.minimize', true);
    // replace current loaders with ExtractTextPlugin
    scssLoaderRule.use = ExtractTextPlugin.extract({
      fallback: 'style-loader',
      use: scssLoaders,
    });
  }
  patchScssLoader(commonWebpackConfig);

  const prodWebpack = merge.smart(commonWebpackConfig, {
    devtool: false,
    output: {
      publicPath: '/',
      filename: 'js/[name].[chunkhash].js',
      chunkFilename: 'js/[name].[chunkhash].js',
      sourceMapFilename: '../dist-source-map/[file].map',
    },
    plugins: plugins.commonsChunkPlugins.concat([
      plugins.getHtmlWebpackPlugin({
        ngStrictDi: '',
      }),
      new ExtractTextPlugin({
        filename: 'styles/[name].[chunkhash].css',
        allChunks: true,
      }),
      new webpack.NoEmitOnErrorsPlugin(),
      new webpack.optimize.UglifyJsPlugin({
        mangle: false,
        sourceMap: true,
      }),
    ]),
    stats: {
      children: false, // hide output from children plugins
    },
  });

  return prodWebpack;
}

module.exports = webpackConfig;
