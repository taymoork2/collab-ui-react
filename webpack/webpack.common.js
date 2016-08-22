const webpack = require('webpack');
const _ = require('lodash');
const args = require('yargs').argv;
const path = require('path');
const loaders = require('./loaders');
const autoprefixer = require('autoprefixer');

/**
 * TODO remove when math-expression-evaluator fixes their release version in 1.2.12
 * https://github.com/redhivesoftware/math-expression-evaluator/pull/2
 */
Array.indexOf = _.indexOf;

module.exports = (function makeWebpackConfig() {
  const config = {};

  config.context = path.resolve('./app');

  config.entry = {
    preload: ['scripts/preload'],
    app: ['bootstrap'],
    styles: ['styles/app'],
  };

  config.output = {
    path: path.resolve('./dist'),
    publicPath: 'http://127.0.0.1:8000/',
    filename: 'js/[name].js',
    chunkFilename: 'js/[name].js',
  };

  config.devtool = 'eval';

  config.module = {
    preLoaders: [],
    postLoaders: [],
    loaders: _.flatten([
      loaders.js,
      loaders.ts,
      loaders.scss,
      loaders.html,
      loaders.fonts,
      loaders.images,
      loaders.vendorImages,
      loaders.assets,
      loaders.dependencies,
    ]),
  };

  if (!args.nolint) {
    config.module.preLoaders.push(loaders.lint);
  }

  config.eslint = {
    failOnError: true,
  };

  config.postcss = [
    autoprefixer({
      browsers: ['last 2 version'],
    }),
  ];

  config.sassLoader = {
    sourceComments: true,
    includePaths: [
      path.resolve('node_modules/bootstrap-sass/assets/stylesheets'),
      path.resolve('node_modules/foundation-sites/scss'),
    ],
  };

  config.plugins = [
    new webpack.ProvidePlugin({
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
    }),
  ];

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

  return config;
}());
