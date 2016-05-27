'use strict';

var csp = require('helmet-csp');

// During development we have only 2 inline scripts: the one preloading the background image
// and the one injected by Browser Sync. We could add whilte-list the SHA1 of those 2 scripts
// but the one for browser sync changes too often (it contains the version number).
// Instead we use 'unsafe-inline' but this should never make it to production ! Production should use
// 'sha256-x+aZvuBn2wT79r4ro+BTMYyQJwOC/JIXRDq4dE+tp9k=' instead, the SHA1 for the image preload script
var onlyForDev = '\'unsafe-inline\'';
module.exports = csp({
  reportOnly: false,
  browserSniff: false,
  directives: {
    defaultSrc: ['\'self\'', '*.statuspage.io', '*.webex.com', '*.wbx2.com', '*.localytics.com', '*.webexconnect.com'],
    connectSrc: ['\'self\'', '*.cisco.com', '*.huron-int.com', '*.huron.uno', '*.huron-dev.com', '*.ciscoccservice.com', '*.statuspage.io', '*.webex.com', '*.wbx2.com', '*.webexconnect.com', 'cdn.mxpnl.com', 'api.mixpanel.com', 'ws://127.0.0.1:8000', 'ws://localhost:8000'],
    imgSrc: ['\'self\'', 'data:', '*.localytics.com', '*.rackcdn.com', '*.clouddrive.com'],
    scriptSrc: ['\'self\'', onlyForDev, '\'unsafe-eval\'', '*.webex.com', '*.localytics.com', 'cdn.mxpnl.com', 'api.mixpanel.com'],
    styleSrc: ['\'self\'', '\'unsafe-inline\'']
  }
});
