/* eslint-env es6 */

'use strict';

const merge = require('webpack-merge');
const cspProdConfig = require('./csp-prod.config');
const mkCspConfig = require('../utils/mkCspConfig');

// as of 2018-01-09, 'cfe' uses no additional directives
let cspCfeConfig = mkCspConfig();

// start with prod CSP dependencies, and merge on top
cspCfeConfig = merge.smart(cspProdConfig, cspCfeConfig);

module.exports = cspCfeConfig;
