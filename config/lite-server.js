var compression = require('compression')();
var customCSPmiddleware = require('../utils/customCSPmiddleware');
var args = require('yargs').argv;

module.exports = {
  port: "8000",
  host: "127.0.0.1",
  files: ['./app/**/*.{html,htm,scss,css,js,ts}'],
  server: {
    middleware: [
      compression,
      customCSPmiddleware,
    ]
  },
  ghostMode: {
    clicks: false,
    forms: false,
    scroll: false,
  },
  open: args.noopen ? false : 'external',
};
