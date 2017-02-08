'use strict';

var csp = require('helmet-csp');

// During development we only have 2 inline scripts: the one preloading the background image
// and the one injected by Browser Sync. We could whitelist the SHA1 of those 2 scripts
// but the one for Browser Sync changes too often (it contains the version number).
// We use 'unsafe-inline' instead, but it should never make it to production! Production should only
// use 'sha256-x+aZvuBn2wT79r4ro+BTMYyQJwOC/JIXRDq4dE+tp9k=', the SHA1 for the image preload script
var inlineScriptOnlyForDev = '\'unsafe-inline\'';
// Localytics will load a pixel image using http when developing locally
var localyticsOnlyForDev = 'http://*.localytics.com';
module.exports = csp({
  reportOnly: false,
  browserSniff: false,
  directives: {
    defaultSrc: [
      '\'self\'',
      'https://*.localytics.com',
      'https://*.statuspage.io',
      'https://*.wbx2.com',
      'https://*.webex.com',
      'https://*.webexconnect.com',
      'https://wbxdmz.admin.ciscospark.com',
      'https://wbxbts.admin.ciscospark.com',
      'blob:'
    ],
    frameSrc: [
      'https://buy.ciscospark.com', // Digital River
    ],
    objectSrc: [
      'http://www.cisco.com', // Terms of Service
    ],
    connectSrc: [
      '\'self\'',
      'wss://mercury-connection-a.wbx2.com',
      'https://*.cisco.com',
      'https://*.ciscoccservice.com',
      'https://*.ciscospark.com',
      'https://*.huron-dev.com',
      'https://*.huron-int.com',
      'https://*.sparkc-eu.com',
      'https://*.huron.uno',
      'https://*.statuspage.io',
      'https://*.wbx2.com',
      'https://*.webex.com',
      'https://*.webexconnect.com',
      'http://api.mixpanel.com',
      'https://api.mixpanel.com',
      'https://cdn.mxpnl.com',
      'http://54.183.25.170:8001',
      'https://clio-manager-a.wbx2.com',
      'https://clio-manager-integration.wbx2.com',
      // manual DNS entry for local dev:
      'http://dev-admin.ciscospark.com:8000',
      'ws://dev-admin.ciscospark.com:8000',
      // Browser Sync:
      'ws://127.0.0.1:8000',
      'ws://localhost:8000',
      // Local Atlas Backend:
      'http://127.0.0.1:8080',
      'http://localhost:8080',
      'http://dev-admin.ciscospark.com:8080',
      'http://dpm.demdex.net', // Adobe DTM Omniture
      'http://ciscowebex.d1.sc.omtrdc.net', // Adobe DTM Omniture
      'https://*.clouddrive.com' // CSV download
    ],
    fontSrc: [
      '\'self\'',
      'http://dev-admin.ciscospark.com:8000', // manual DNS entry for local dev
    ],
    imgSrc: [
      '\'self\'',
      'data:',
      localyticsOnlyForDev,
      'https://*.clouddrive.com',
      'https://*.localytics.com',
      'https://*.rackcdn.com',
      'http://webexglobal.112.2o7.net', // Adobe DTM Omniture
      'http://*.d1.sc.omtrdc.net', // Adobe DTM Omniture
      'http://dev-admin.ciscospark.com:8000', // manual DNS entry for local dev
      // Webpack Dev
      'blob:',
    ],
    scriptSrc: [
      '\'self\'',
      inlineScriptOnlyForDev,
      '\'unsafe-eval\'',
      'https://*.localytics.com',
      'https://*.webex.com',
      'https://api.mixpanel.com', // Mixpanel
      'https://cdn.mxpnl.com', // Mixpanel
      'http://assets.adobedtm.com', // Adobe DTM Omniture
      'http://dpm.demdex.net', // Adobe DTM Omniture
      'http://ciscowebex.d1.sc.omtrdc.net', // Adobe DTM Omniture
      'https://buy.ciscospark.com', // Digital River
      'http://dev-admin.ciscospark.com:8000', // manual DNS entry for local dev
    ],
    styleSrc: [
      '\'self\'',
      '\'unsafe-inline\'',
      'http://dev-admin.ciscospark.com:8000', // manual DNS entry for local dev
      // Webpack Dev
      'blob:',
    ]
  }
});
