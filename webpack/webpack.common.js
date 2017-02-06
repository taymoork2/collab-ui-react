const webpack = require('webpack');
const _ = require('lodash');
const args = require('yargs').argv;
const path = require('path');
const loaders = require('./loaders');
// const StyleLintPlugin = require('stylelint-webpack-plugin');

const host = args.host || '127.0.0.1';
const port = args.port || '8000';

function webpackConfig(env) {
  const config = {};
  config.context = path.resolve('./app');

  config.entry = {
    preload: ['scripts/preload'],
    app: ['bootstrap'],
    styles: ['styles/app'],
  };

  config.output = {
    path: path.resolve('./dist'),
    publicPath: `http://${host}:${port}/`,
    filename: 'js/[name].js',
    chunkFilename: 'js/[name].js',
  };

  config.devtool = 'eval';

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

  if (!env.nolint) {
    config.module.rules.push(loaders.eslint);
    config.module.rules.push(loaders.tslint);
  }

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

  // Activate once IntelliJ / WebStorm supports stylelint
  // if (!env.nolint) {
  //   config.plugins.push(new StyleLintPlugin({
  //     configFile: '.stylelintrc.js',
  //     failOnError: true,
  //   }));
  // }

  config.resolve = {
    extensions: ['.ts', '.js', '.json', '.css', '.scss', '.html'],
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
      imagesloaded: 'imagesloaded/imagesloaded.pkgd.js',
      'masonry-layout': 'masonry-layout/dist/masonry.pkgd.js',
    },
    modules: [
      path.resolve('./app'),
      path.resolve('./test'),
      'node_modules',
    ],
  };

  return config;
}

module.exports = webpackConfig;
