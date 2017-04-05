var webpack = require('webpack');
var args = require('yargs').argv;
var webpackMiddleware = require('webpack-dev-middleware');
var webpackHotMiddleware = require('webpack-hot-middleware');
var liteServerConfig = require('./lite-server');
var _ = require('lodash');

// populate node env like webpack env args
_.assignIn(process.env, args.env);
var webpackConfig = require('../webpack.config.js')(process.env);
var compiler = webpack(webpackConfig);

// similar to webpack/bin/webpack.js
var ProgressPlugin = require('webpack/lib/ProgressPlugin');
compiler.apply(new ProgressPlugin());

liteServerConfig.server.baseDir = './dist';
liteServerConfig.server.middleware.push(
  webpackMiddleware(compiler, {
    publicPath: webpackConfig.output.publicPath,
    stats: 'minimal',
  }),
  webpackHotMiddleware(compiler)
);

module.exports = liteServerConfig;
