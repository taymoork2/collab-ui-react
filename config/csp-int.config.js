/* eslint-env es6 */

'use strict';

const merge = require('webpack-merge');
const cspProdConfig = require('./csp-prod.config');
const mkCspConfig = require('../utils/mkCspConfig');

// as of 2018-01-09, 'int' uses the following additional directives:
let cspIntConfig = mkCspConfig({
  connectSrc: [
    'https://rcdn6-vm81-32.cisco.com:8082', // Test as a service DEMO
  ],
});

// start with prod CSP dependencies, and merge on top
cspIntConfig = merge.smart(cspProdConfig, cspIntConfig);

module.exports = cspIntConfig;
