(function () {
  'use strict';

  module.exports = angular
    .module('core.responseinterceptor', [
      require('modules/core/scripts/services/log')
    ])
    .factory('ResponseInterceptor', ResponseInterceptor)
    .name;

  /* @ngInject */
  function ResponseInterceptor($q, $injector, Config, Log) {

    return {
      responseError: function (response) {
        // injected manually to get around circular dependency problem with $translateProvider
        // http://stackoverflow.com/questions/20647483/angularjs-injecting-service-into-a-http-interceptor-circular-dependency/21632161
        var Auth = $injector.get('Auth');
        if (is20001Error(response)) {
          Log.warn('Refresh access token due to 20001 response.', response);
          if (!Config.isE2E()) {
            return Auth.refreshAccessTokenAndResendRequest(response);
          }
        }
        if (isHttpAuthError(response)) {
          Log.warn('Refresh access token due to HTTP authentication error.', response);
          if (!Config.isE2E()) {
            return Auth.refreshAccessTokenAndResendRequest(response);
          }  
        }
        if (isCIInvalidAccessTokenError(response)) {
          Log.warn('Refresh access token due to invalid CI error.', response);
          if (!Config.isE2E()) {
            return Auth.refreshAccessTokenAndResendRequest(response);
          } 
        }

        if (refreshTokenHasExpired(response)) {
          Log.warn('Refresh-token has expired.', response);
          return Auth.logout();
        }

        if (refreshTokenIsInvalid(response)) {
          Log.warn('Refresh-token is invalid.', response);
          return Auth.logout();
        }

        return $q.reject(response);
      }
    };

    function is20001Error(response) {
      return response.status == 401 && responseContains(response, '200001');
    }

    function isHttpAuthError(response) {
      return response.status == 401 && responseContains(response, 'This request requires HTTP authentication');
    }

    function isCIInvalidAccessTokenError(response) {
      return response.status == 400 && responseContains(response, "Invalid access token");
    }

    function refreshTokenHasExpired(response) {
      return response.status == 400 && responseContains(response, "The refresh token provided is expired");
    }

    function refreshTokenIsInvalid(response) {
      return response.status == 400 && responseContains(response, "The requested scope is invalid");
    }

    function responseContains(response, searchString) {
      if (!response || !response.data) {
        return false;
      }
      var responseData = JSON.stringify(response.data);
      return responseData.indexOf(searchString) != -1;
    }
  }

})();
