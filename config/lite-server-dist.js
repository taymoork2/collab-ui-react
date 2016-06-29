var compression = require('compression')();
var customCSPmiddleware = require('../utils/customCSPmiddleware');

module.exports = {
  port: "8000",
  host: "127.0.0.1",
  server: {
    baseDir: "./dist",
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
  open: false,
  codeSync: false
};
