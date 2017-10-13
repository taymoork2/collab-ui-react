'use strict';

var csp = require('helmet-csp');
var cspDevData = require('../config/csp-dev.config');

var devDependancies = {
  reportOnly: false,
  browserSniff: false,
  directives: cspDevData,
};

module.exports = csp(devDependancies);
