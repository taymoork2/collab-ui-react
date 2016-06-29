'use strict';

var _ = require('lodash');
var args = require('yargs').argv;
var path = require('path');
var env = require('./webpack/env');
var loaders = require('./webpack/loaders');
var postcss = require('./webpack/postcss');
var plugins = require('./webpack/plugins');

module.exports = (function makeWebpackConfig() {
  var config = {};

  config.context = __dirname + '/app';

  config.entry = env.isTest ? {} : {
    preload: './scripts/preload.js',
    app: './bootstrap.js',
  };

  config.output = env.isTest ? {} : {
    path: __dirname + '/dist',
    publicPath: env.isProd ? '/' : 'http://127.0.0.1:8000/',
    filename: env.isProd ? 'js/[name].[hash].js' : 'js/[name].js',
    chunkFilename: env.isProd ? 'js/[name].[hash].js' : 'js/[name].js',
  };

  if (env.isTest) {
    config.devtool = 'inline-source-map';
  } else if (env.isProd) {
    config.devtool = 'source-map';
  } else {
    config.devtool = 'eval';
  }

  config.module = {
    preLoaders: [],
    postLoaders: [],
    loaders: _.flatten([
      loaders.js,
      loaders.ts,
      loaders.scss,
      loaders.css,
      loaders.html,
      loaders.fonts,
      loaders.images,
      loaders.vendorImages,
      loaders.assets,
      loaders.dependencies,
    ]),
  };

  if (!env.isTest && !args.nolint) {
    config.module.preLoaders.push(loaders.lint);
  }

  if (env.isTest && !env.isTestDebug) {
    config.module.postLoaders.push(loaders.instrument);
  }

  config.eslint = {
    failOnError: true,
  };

  config.jscs = {
    emitErrors: true,
    failOnHint: true,
  };

  config.postcss = postcss;

  config.sassLoader = loaders.sassLoader;

  config.plugins = plugins;

  config.resolve = {
    extensions: ['', '.ts', '.js', '.json', '.css', '.scss', '.html'],
    alias: {
      // App aliases (used by ProvidePlugin)
      clipboard: 'clipboard/dist/clipboard.js',
      d3: 'd3/d3.js',
      humanizeDuration: 'angular-timer/bower_components/humanize-duration/humanize-duration.js',
      jquery: 'jquery/dist/jquery',
      jstimezonedetect: 'jstimezonedetect/dist/jstz.js',
      x2js: 'x2js/xml2json.js',
      // Test aliases
      sinon: 'sinon/pkg/sinon.js',
    },
    root: [
      path.resolve('./app'),
      path.resolve('./test'),
    ],
  };

  config.devServer = {
    host: '127.0.0.1',
    port: 8000,
    contentBase: './app',
    stats: 'minimal',
  };

  return config;
}());
