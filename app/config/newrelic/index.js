/* eslint-disable */
var hostnameConfig = require('../hostname.config');
if (window && window.location) {
  if (window.location.hostname === hostnameConfig.PRODUCTION) {
    require('./newrelic.prod');
  } else if (window.location.hostname === hostnameConfig.INTEGRATION) {
    require('./newrelic.int');
  }
}
