/* eslint-env es6 */

'use strict';

const merge = require('webpack-merge');
const cspIntConfig = require('./csp-int.config');
const mkCspConfig = require('../utils/mkCspConfig');

// TODO(brspence): remove http://dev-admin.ciscospark.com:8000 src by 2018-07
// as of 2018-01-09, 'dev' uses the following additional directives:
let cspDevConfig = mkCspConfig({
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
  objectSrc: ["'none'"], // helmet-csp needs atleast one value for this directive
  connectSrc: [
    'http://127.0.0.1:8080', // Local Atlas Backend
    'http://dev-admin.ciscospark.com:8000', // manual DNS entry for local dev
    'http://dev-admin.webex.com:8000', // manual DNS entry for local dev
    'http://localhost:8080', // Local Atlas Backend
    'http://localhost:8090', // Lcoal Expert Virtual Assistant Backend
    'https://10.224.166.46:8443',
    'ws://127.0.0.1:8000', // Browser Sync
    'ws://127.0.0.1:8443', // Browser Sync
    'ws://dev-admin.ciscospark.com:8000', // manual DNS entry for local dev
    'ws://dev-admin.webex.com:8000', // manual DNS entry for local dev
    'ws://localhost:8000', // Browser Sync
    'ws://localhost:8443', // Browser Sync
    'https://upgrade.int-ucmgmt.cisco.com', //HCS Upgrade
    'https://licensing.int-ucmgmt.cisco.com', //HCS License
    'https://controller.int-ucmgmt.cisco.com', //HCS Controller
    'http://172.24.77.211:80', //broadcloud dev and int
  ],
  fontSrc: [
    'http://dev-admin.ciscospark.com:8000', // manual DNS entry for local dev
    'http://dev-admin.webex.com:8000', // manual DNS entry for local dev
  ],
  imgSrc: [
    'blob:', // Webpack Dev
    'http://*.localytics.com', // Localytics will load a pixel image using http when developing locally
    'http://dev-admin.ciscospark.com:8000', // manual DNS entry for local dev
    'http://dev-admin.webex.com:8000', // manual DNS entry for local dev
  ],
  scriptSrc: [
    '\'nonce-browser-sync-dev\'', // browser-sync-dev nonce configured in ./lite-server.js
    '127.0.0.1',
    'http://dev-admin.ciscospark.com:8000', // manual DNS entry for local dev
    'http://dev-admin.webex.com:8000', // manual DNS entry for local dev
    'http://cdn.segment.com', // non-HTTPS Segment Analytics
  ],
  styleSrc: [
    'blob:', // Webpack Dev
    'http://dev-admin.ciscospark.com:8000', // manual DNS entry for local dev
    'http://dev-admin.webex.com:8000', // manual DNS entry for local dev
  ],
});

// start with int CSP dependencies, and merge on top
cspDevConfig = merge.smart(cspIntConfig, cspDevConfig);

module.exports = cspDevConfig;
