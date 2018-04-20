var liteServerConfig = require('./lite-server');
liteServerConfig.server.baseDir = './dist';
liteServerConfig.codeSync = false;

liteServerConfig.server.middleware.push(function (req, res, next) {
  if (/\.(js|css)$/.test(req.url)) {
    res.setHeader('Cache-Control', 'max-age=604800'); // 1 week
  }
  if (/\.(ico|png|jpg|jpeg|gif|svg|eot|woff|woff2|ttf)(\?.*)?$/.test(req.url)) {
    res.setHeader('Cache-Control', 'max-age=86400'); // 1 day
  }
  next();
});

module.exports = liteServerConfig;
