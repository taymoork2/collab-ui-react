'use strict';

var csp = require('helmet-csp');

// During development we only have 2 inline scripts: the one preloading the background image
// and the one injected by Browser Sync. We could whitelist the SHA1 of those 2 scripts
// but the one for Browser Sync changes too often (it contains the version number).
// We use 'unsafe-inline' instead, but it should never make it to production! Production should only
// use 'sha256-x+aZvuBn2wT79r4ro+BTMYyQJwOC/JIXRDq4dE+tp9k=', the SHA1 for the image preload script
var onlyForDev = '\'unsafe-inline\'';
module.exports = csp({
  reportOnly: false,
  browserSniff: false,
  directives: {
    defaultSrc: [
      '\'self\'',
      '*.localytics.com',
      '*.statuspage.io',
      '*.wbx2.com',
      '*.webex.com',
      '*.webexconnect.com'
    ],
    connectSrc: [
      '\'self\'',
      '*.cisco.com',
      '*.ciscoccservice.com',
      '*.huron-dev.com',
      '*.huron-int.com',
      '*.huron.uno',
      '*.statuspage.io',
      '*.wbx2.com',
      '*.webex.com',
      '*.webexconnect.com',
      'api.mixpanel.com',
      'cdn.mxpnl.com',
      'http://127.0.0.1:8080',
      'http://localhost:8080',
      'ws://127.0.0.1:8000',
      'ws://localhost:8000'
    ],
    imgSrc: [
      '\'self\'',
      'data:',
      '*.clouddrive.com',
      '*.localytics.com',
      '*.rackcdn.com'
    ],
    scriptSrc: [
      '\'self\'',
      onlyForDev,
      '\'unsafe-eval\'',
      '*.localytics.com',
      '*.webex.com',
      'api.mixpanel.com',
      'cdn.mxpnl.com'
    ],
    styleSrc: [
      '\'self\'',
      '\'unsafe-inline\''
    ]
  }
});
