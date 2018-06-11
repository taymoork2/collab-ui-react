const _ = require('lodash');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const StyleLintPlugin = require('stylelint-webpack-plugin');
const stylelintFormatter = require('stylelint-formatter-pretty');

const isVendor = module => module.context && module.context.includes('node_modules');

const commonsChunkPlugins = [
  // separate app vendor files
  new webpack.optimize.CommonsChunkPlugin({
    chunks: ['bootstrap'],
    name: 'bootstrap-vendor',
    minChunks: isVendor,
  }),
  // separate async vendor files
  new webpack.optimize.CommonsChunkPlugin({
    chunks: ['modules'],
    async: 'modules-vendor',
    minChunks: isVendor,
  }),
  // separate runtime functions
  new webpack.optimize.CommonsChunkPlugin({
    name: 'manifest',
    minChunks: Infinity,
  }),
];

const styleLintPlugin = new StyleLintPlugin({
  configFile: '.stylelintrc.js',
  failOnError: true,
  formatter: stylelintFormatter,
  syntax: 'scss',
});

function getHtmlWebpackPlugin(options) {
  return new HtmlWebpackPlugin(_.assignIn({
    template: 'index.html',
    chunks: ['manifest', 'preload', 'styles', 'bootstrap-vendor', 'bootstrap'],
    inject: false,
    headChunks: ['manifest'],
    bodyChunks: ['preload', 'styles', 'bootstrap-vendor', 'bootstrap'],
  }, options));
}

exports.commonsChunkPlugins = commonsChunkPlugins;
exports.getHtmlWebpackPlugin = getHtmlWebpackPlugin;
exports.styleLintPlugin = styleLintPlugin;
