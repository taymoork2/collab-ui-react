(function () {
  'use strict';

  angular
    .module('Core')
    .factory('ServerErrorInterceptor', ServerErrorInterceptor);

  /* @ngInject */
  function ServerErrorInterceptor($q, $log, Authinfo, Config) {

    function responseHandler(response) {
      if (!Config.isProd() && response.status >= 400 && response.status != 404) {
        $log.error(
          'Request failed with status ' + response.status + '\n' +
          'Request: ' + response.config.method + ' ' + response.config.url + '\n' +
          (response.config.data ? 'Data: ' + JSON.stringify(response.config.data) + '\n' : '') +
          (response.config.headers.TrackingID ? 'Tracking ID: ' + response.config.headers.TrackingID + '\n' : '') +
          'User: ' + Authinfo.getUserName() + ' (' + Authinfo.getUserId() + ')\n' +
          'Organization: ' + Authinfo.getOrgName() + ' (' + Authinfo.getOrgId() + ')'
        );
      }
      return response;
    }

    return {
      responseError: function (response) {
        return $q.reject(responseHandler(response));
      }
    };
  }

})();
