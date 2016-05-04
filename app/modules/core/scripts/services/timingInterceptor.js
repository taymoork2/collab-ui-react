(function () {
  'use strict';

  var THRESHOLD = 15 * 1000;

  angular
    .module('Core')
    .factory('TimingInterceptor', TimingInterceptor);

  /* @ngInject */
  function TimingInterceptor($q, $log, Authinfo, Config) {

    function requestHandler(config) {
      config.requestTimestamp = new Date().getTime();
      return config;
    }

    function responseHandler(responseOrRejection) {
      var requestTimestamp = _.get(responseOrRejection, 'config.requestTimestamp');
      if (requestTimestamp) {
        var config = responseOrRejection.config;
        config.responseTimestamp = new Date().getTime();
        var duration = config.responseTimestamp - requestTimestamp;
        if (!Config.isProd() && duration > THRESHOLD) {
          $log.error(
            'Request exceeded max threshold of ' + Math.round(THRESHOLD / 1000) + ' seconds. \n' +
            'Duration: ' + Math.round(duration / 1000) + ' seconds. \n' +
            'Request: ' + config.method + ' ' + config.url + '\n' +
            (config.data ? 'Data: ' + JSON.stringify(config.data) + '\n' : '') +
            (config.headers.TrackingID ? 'Tracking ID: ' + config.headers.TrackingID + '\n' : '') +
            'User: ' + Authinfo.getUserName() + ' (' + Authinfo.getUserId() + ')\n' +
            'Organization: ' + Authinfo.getOrgName() + ' (' + Authinfo.getOrgId() + ')'
          );
        }
      }
      return responseOrRejection;
    }

    return {
      request: requestHandler,
      response: responseHandler,
      responseError: function (responseOrRejection) {
        return $q.reject(responseHandler(responseOrRejection));
      }
    };
  }

})();
