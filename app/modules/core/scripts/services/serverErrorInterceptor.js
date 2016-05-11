(function () {
  'use strict';

  angular
    .module('Core')
    .factory('ServerErrorInterceptor', ServerErrorInterceptor);

  /* @ngInject */
  function ServerErrorInterceptor($q, $log, $injector, Config) {

    return {
      responseError: function (response) {
        return $q.reject(responseHandler(response));
      }
    };

    function responseHandler(response) {
      // injected manually to get around circular dependency problem with $translateProvider
      var Authinfo = $injector.get('Authinfo');
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
  }

})();
