const webpack = require('webpack');
const _ = require('lodash');
const args = require('yargs').argv;
const path = require('path');
const loaders = require('./loaders');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const host = args.host || '127.0.0.1';
const port = args.port || '8000';

function webpackConfig(env) {
  const config = {};
  config.context = path.resolve('./app');

  config.entry = {
    preload: ['scripts/preload'],
    bootstrap: ['polyfills', 'bootstrap'],
    styles: ['styles/app'],
  };

  config.output = {
    path: path.resolve('./dist'),
    publicPath: `http://${host}:${port}/`,
    filename: 'js/[name].js',
    chunkFilename: 'js/[name].js',
  };

  config.devtool = env['no-devtool'] ? false : 'eval';

  config.module = {
    rules: _.flatten([
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
    noParse: [
      /messageformat\/messageformat\.js/,
      /clipboard\/dist\/clipboard.js/,
      /\/google-libphonenumber\/dist\/browser\/libphonenumber.js/,
      /\/query-command-supported\/dist\/queryCommandSupported.js/,
    ],
  };

  config.plugins = [
    new webpack.ProgressPlugin(),
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
    }),
  ];

  // remove ProgressPlugin if requested via CLI
  if (env.noprogress) {
    config.plugins.shift();
  }

  if (env.analyze) {
    config.plugins.push(new BundleAnalyzerPlugin());
  }

  config.resolve = {
    // For npm link - don't resolve path to a local directory outside of node_modules
    symlinks: false,
    // Resolve .js before .ts
    extensions: ['.js', '.ts', '.json', '.css', '.scss', '.html'],
    alias: {
      // App aliases (used by ProvidePlugin)
      clipboard: 'clipboard/dist/clipboard.js',
      d3: 'd3/d3.js',
      humanizeDuration: 'angular-timer/bower_components/humanize-duration/humanize-duration.js',
      jquery: 'jquery/dist/jquery',
      jstimezonedetect: 'jstimezonedetect/dist/jstz.js',
      // Test aliases
      sinon: 'sinon/pkg/sinon.js',
      imagesloaded: 'imagesloaded/imagesloaded.pkgd.js',
      'masonry-layout': 'masonry-layout/dist/masonry.pkgd.js',
    },
    modules: [
      path.resolve('./app'),
      path.resolve('./test'),
      path.resolve('./thirdparty-shims'),
      // load external modules from our project dependencies first
      path.resolve('./node_modules'),
      'node_modules',
    ],
  };

  return config;
}

module.exports = webpackConfig;
