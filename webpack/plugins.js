const env = require('./env');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
// const CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;

const plugins = [];

if (!env.isTest) {
  plugins.push(
    new HtmlWebpackPlugin({
      template: './index.html',
      inject: 'body',
    })
  );
}
plugins.push(new ExtractTextPlugin('[name].[hash].css', { disable: !env.isProd }));

plugins.push(new webpack.ProvidePlugin({
  $: 'jquery',
  _: 'lodash',
  Clipboard: 'clipboard',
  d3: 'd3',
  humanizeDuration: 'humanizeDuration',
  jQuery: 'jquery',
  jstz: 'jstimezonedetect',
  MessageFormat: 'messageformat',
  moment: 'moment',
  punycode: 'punycode',
  X2JS: 'x2js',
}));

// Production Plugins
if (env.isProd) {
  plugins.push(
    new webpack.NoErrorsPlugin(),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin({
      mangle: false,
    })
  );
}

module.exports = plugins;
