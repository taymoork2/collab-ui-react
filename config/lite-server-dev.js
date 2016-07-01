var webpack = require('webpack');
var webpackConfig = require('../webpack.config.js');
var webpackMiddleware = require('webpack-dev-middleware');

var liteServerConfig = require('./lite-server');
liteServerConfig.server.baseDir = './app';
liteServerConfig.server.middleware.push(webpackMiddleware(webpack(webpackConfig), {
  publicPath: webpackConfig.output.publicPath,
  stats: 'minimal',
}));

module.exports = liteServerConfig;
