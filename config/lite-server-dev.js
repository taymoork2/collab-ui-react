var compression = require('compression')();
var customCSPmiddleware = require('../utils/customCSPmiddleware');
var webpack = require('webpack');
var webpackConfig = require('../webpack.config.js');
var webpackMiddleware = require('webpack-dev-middleware');

module.exports = {
  port: "8000",
  host: "127.0.0.1",
  files: ['./app/**/*.{html,htm,scss,css,js,ts}'],
  server: {
    baseDir: "./app",
    middleware: [
      compression,
      customCSPmiddleware,
      webpackMiddleware(webpack(webpackConfig), {
        publicPath: webpackConfig.output.publicPath,
        stats: 'minimal',
      }),
    ]
  },
  ghostMode: {
    clicks: false,
    forms: false,
    scroll: false,
  },
  open: 'external',
};
