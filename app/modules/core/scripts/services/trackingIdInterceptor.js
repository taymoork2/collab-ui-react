(function () {
  'use strict';

  angular
    .module('Core')
    .factory('TrackingIDInterceptor', TrackingIDInterceptor);

  /* @ngInject */
  function TrackingIDInterceptor() {
    return {
      'request': function (config) {
        if (config.url.indexOf('statuspage.io') > -1 ||
          config.url.indexOf('hercules') > -1) {
          config.headers.TrackingID = undefined;
        }
        return config;
      }
    };
  }
})();
