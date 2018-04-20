var compression = require('compression')();
var customCSPmiddleware = require('../utils/customCSPmiddleware');
var history = require('connect-history-api-fallback');
var args = require('yargs').argv;
var host = args.host || '127.0.0.1';
var port = args.port || '8000';

module.exports = {
  port: port,
  host: host,
  files: ['./app/**/*.{html,js,ts,json,csv,pdf}'],
  server: {
    middleware: [
      compression,
      customCSPmiddleware,
      history(),
    ],
  },
  ghostMode: {
    clicks: false,
    forms: false,
    scroll: false,
  },
  open: args.noopen ? false : 'external',
  snippetOptions: {
    rule: {
      match: /<\/head>/i,
      fn: function (snippet, match) {
        return snippet.replace('id=', 'nonce="browser-sync-dev" id=') + match;
      },
    },
  },
};
