(function () {
  'use strict';

  var THRESHOLD = 10 * 1000;

  angular
    .module('Core')
    .factory('TimingInterceptor', TimingInterceptor);

  /* @ngInject */
  function TimingInterceptor($q, $log, Authinfo, Config) {

    function requestHandler(config) {
      config.requestTimestamp = new Date().getTime();
      return config;
    }

    function responseHandler(response) {
      response.config.responseTimestamp = new Date().getTime();
      var duration = response.config.responseTimestamp - response.config.requestTimestamp;
      if (!Config.isProd() && duration > THRESHOLD) {
        $log.error(
          'HTTP Request exceeded max threshold. \n' +
          'Threshold: ' + Math.round(THRESHOLD / 1000) + ' seconds. \n' +
          'Actual time: ' + Math.round(duration / 1000) + ' seconds. \n' +
          'Request: ' + response.config.method + ' ' + response.config.url + '\n' +
          (response.config.data ? 'Data: ' + JSON.stringify(response.config.data) + '\n' : '') +
          'User: ' + Authinfo.getUserName() + ' (' + Authinfo.getUserId() + ')\n' +
          'Organization: ' + Authinfo.getOrgName() + ' (' + Authinfo.getOrgId() + ')'
        );
      }
      return response;
    }

    return {
      request: requestHandler,
      response: responseHandler,
      responseError: function (response) {
        return $q.reject(responseHandler(response));
      }
    };
  }

})();
