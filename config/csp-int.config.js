/* eslint-env es6 */

'use strict';

const merge = require('webpack-merge');
const cspProdConfig = require('./csp-prod.config');
const mkCspConfig = require('../utils/mkCspConfig');

// as of 2018-01-09, 'int' uses the following additional directives:
let cspIntConfig = mkCspConfig({
  connectSrc: [
    'https://uctaas.cisco.com:8082', // Test as a service DEMO
    'https://upgrade.int-ucmgmt.cisco.com', //HCS Upgrade as a service
    'https://licensing.int-ucmgmt.cisco.com', //HCS Upgrade as a service
    'https://controller.int-ucmgmt.cisco.com', //HCS Upgrade as a service
    'http://172.24.77.211:8000', //broadcloud dev and int
  ],
});

// start with prod CSP dependencies, and merge on top
cspIntConfig = merge.smart(cspProdConfig, cspIntConfig);

module.exports = cspIntConfig;
