var liteServerConfig = require('./lite-server');
liteServerConfig.server.baseDir = './dist';
liteServerConfig.codeSync = false;

module.exports = liteServerConfig;
