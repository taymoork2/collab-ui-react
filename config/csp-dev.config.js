var merge = require('webpack-merge');
var cspProdConfig = require('./csp-prod.config');

var cspDevConfig = {
  defaultSrc: [],
  frameSrc: [
    'https://*.cisco.com:4244',
    'https://*.cisco.com:4248',
    'https://*.webex.com:4244',
    'https://*.webex.com:4248',
    'http://127.0.0.1:8000',
    'https://10.140.50.27',
    'https://10.29.42.18:4244',
    'https://10.29.42.18',
    'https://10.29.42.19:4244',
    'https://10.29.42.19',
  ],
  objectSrc: [],
  connectSrc: [
    'http://10.201.82.158:8082', //Test as a service DEMO -- Matt's server
    'http://rcdn6-vm81-32.cisco.com:8082', //Test as a service DEMO
    'http://127.0.0.1:8080', // Local Atlas Backend
    'http://dev-admin.ciscospark.com:8000', // manual DNS entry for local dev
    'http://localhost:8080', // Local Atlas Backend
    'http://localhost:8090', // Lcoal Expert Virtual Assistant Backend
    'https://10.224.166.46:8443',
    'ws://127.0.0.1:8000', // Browser Sync
    'ws://127.0.0.1:8443', // Browser Sync
    'ws://dev-admin.ciscospark.com:8000', // manual DNS entry for local dev
    'ws://localhost:8000', // Browser Sync
    'ws://localhost:8443', // Browser Sync
    'http://ciscowebex.d1.sc.omtrdc.net', // Adobe DTM Omniture
    'http://dpm.demdex.net', // Adobe DTM Omniture
  ],
  fontSrc: [
    'http://dev-admin.ciscospark.com:8000', // manual DNS entry for local dev
  ],
  imgSrc: [
    'blob:', // Webpack Dev
    'http://*.localytics.com', // Localytics will load a pixel image using http when developing locally
    'http://dev-admin.ciscospark.com:8000', // manual DNS entry for local dev
    'http://webexglobal.112.2o7.net', // Adobe DTM Omniture
    'http://*.d1.sc.omtrdc.net', // Adobe DTM Omniture
  ],
  scriptSrc: [
    // During development, we only have 2 inline scripts: the one preloading the background image
    // and the one injected by Browser Sync. We could whitelist the SHA1 of those 2 scripts
    // but the one for Browser Sync changes too often (it contains the version number).
    // We use 'unsafe-inline' instead, but it should never make it to production!
    '\'unsafe-inline\'',
    '127.0.0.1',
    'http://dev-admin.ciscospark.com:8000', // manual DNS entry for local dev
    'http://assets.adobedtm.com', // Adobe DTM Omniture
    'http://dpm.demdex.net', // Adobe DTM Omniture
    'http://*.omtrdc.net', // Adobe DTM Ominture
  ],
  styleSrc: [
    'blob:', // Webpack Dev
    'http://dev-admin.ciscospark.com:8000', // manual DNS entry for local dev
  ],
};

// smart merging prod dependencies with dev dependencies
cspDevConfig = merge.smart(cspProdConfig, cspDevConfig);

module.exports = cspDevConfig;
