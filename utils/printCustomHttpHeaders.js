'use strict';

var _ = require('lodash');
var customHttpHeaders = require('../config/custom-http-headers.config.js');

_.forEach(customHttpHeaders, function (val, key) {
  console.log(key + ': ' + val);
});
