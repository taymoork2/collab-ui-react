(function () {
  'use strict';

  angular
    .module('Core')
    .factory('TrackingIDInterceptor', TrackingIDInterceptor);

  /* @ngInject */
  function TrackingIDInterceptor() {
    var trackingID = 'TrackingID';
    return {
      'request': function (config) {
        if (config.url.indexOf('statuspage.io') > -1 ||
          config.url.indexOf('hercules') > -1) {
          config.headers.TrackingID = undefined;
        }
        if (config.url.indexOf('huron-dev.com') != -1) {
          var exposeHeaders = config.headers['Access-Control-Expose-Headers'];
          if (angular.isUndefined(exposeHeaders)) {
            exposeHeaders = trackingID;
          } else if (exposeHeaders.indexOf(trackingID) == -1) {
            exposeHeaders += ',' + trackingID;
          }
          config.headers['Access-Control-Expose-Headers'] = exposeHeaders;
        }
        return config;
      }
    };
  }
})();
