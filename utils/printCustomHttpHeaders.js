'use strict';

/* eslint-env es6 */

var _ = require('lodash');
var customHttpHeaders = require('../config/custom-http-headers.config.js');

_.forEach(customHttpHeaders, function (val, key) {
  console.log(`${key} "${val}";`);
});
