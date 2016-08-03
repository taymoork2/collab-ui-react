var webpack = require('webpack');
var webpackConfig = require('../webpack.config.js');
var webpackMiddleware = require('webpack-dev-middleware');
var webpackHotMiddleware = require('webpack-hot-middleware');
var liteServerConfig = require('./lite-server');
var compiler = webpack(webpackConfig);

liteServerConfig.server.baseDir = './app';
liteServerConfig.server.middleware.push(
  webpackMiddleware(compiler, {
    publicPath: webpackConfig.output.publicPath,
    stats: 'minimal',
  }),
  webpackHotMiddleware(compiler)
);

module.exports = liteServerConfig;
