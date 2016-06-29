const path = require('path');
const env = require('./env');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

exports.js = {
  test: /\.js$/,
  loaders: ['ng-annotate'],
  exclude: [/node_modules/, /\.spec\.js$/],
};

exports.lint = {
  test: /\.js$/,
  loaders: ['eslint', 'jscs-loader'],
  exclude: [/node_modules/, /\.spec\.js$/],
};

exports.ts = {
  test: /\.ts$/,
  loader: 'ts',
  exclude: [env.isTest ? /\.(e2e)\.ts$/ : /\.(spec|e2e)\.ts$/, /node_modules\/(?!(ng2-.+))/],
};

exports.scss = {
  test: /\.scss$/,
  loader: env.isTest ? 'null' : ExtractTextPlugin.extract('style', 'css?sourceMap!postcss!sass'),
};

exports.css = {
  test: /\.css$/,
  loader: env.isTest ? 'null' : ExtractTextPlugin.extract('style', 'css?sourceMap!postcss'),
};

exports.html = {
  test: /\.html$/,
  exclude: /\/app\/index.html$/,
  loader: `ngtemplate?module=atlas.templates&relativeTo=${path.resolve('./app')}/!raw`,
};

exports.assets = {
  test: /\.(json|csv|pdf)(\?v=.*)?$/,
  loader: 'file?name=[path][name].[ext]',
};

exports.fonts = {
  test: /\.(woff|woff2|ttf|eot)(\?v=.*)?$/,
  loader: 'file?name=fonts/[name].[ext]',
};

exports.images = {
  test: /\.(svg|png|jpg|jpeg|gif|ico)(\?v=.*)?$/,
  loader: 'file?name=[path][name].[ext]',
  exclude: [/collab-amcharts/, /node_modules/],
};

exports.vendorImages = {
  test: /\.(svg|png|jpg|jpeg|gif|ico)(\?v=.*)?$/,
  loader: 'file?name=images/[name].[ext]',
  include: /node_modules/,
  exclude: /collab-amcharts/,
};

exports.dependencies = [{
  test: /jquery.js$/,
  loader: 'expose?$!expose?jQuery',
}, {
  test: /(FileSaver|fabric).js$/,
  loader: 'script',
}, {
  test: /(bootstrap-tokenfield).js$/,
  loader: 'imports?define=>false',
}, {
  test: /bard.js$/,
  loader: 'script',
}, {
  test: /\/sinon.js$/,
  loader: 'script',
}, {
  test: /jasmine-promise-matchers.js$/,
  loader: 'script',
}];

exports.instrument = {
  test: /\.js$/,
  exclude: [
    /node_modules/,
    /spec\.js$/,
  ],
  loader: 'istanbul-instrumenter-loader',
};

exports.sassLoader = {
  includePaths: [
    path.resolve('node_modules/bootstrap-sass/assets/stylesheets'),
    path.resolve('node_modules/foundation-sites/scss'),
  ],
};
