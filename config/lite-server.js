var compression = require('compression')();
var customCSPmiddleware = require('../utils/customCSPmiddleware');
var args = require('yargs').argv;

module.exports = {
  port: "8000",
  host: "127.0.0.1",
  files: ['./app/**/*.{html,js,ts,json,csv,pdf}'],
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
