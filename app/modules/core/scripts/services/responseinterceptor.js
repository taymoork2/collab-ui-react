(function () {
  'use strict';

  module.exports = angular
    .module('core.responseinterceptor', [
      require('modules/core/auth/auth'),
      require('modules/core/scripts/services/log'),
    ])
    .factory('ResponseInterceptor', ResponseInterceptor)
    .name;

  /* @ngInject */
  function ResponseInterceptor($q, $injector, Log) {
    var HAS_RETRIED = 'config.hasRetried';
    var responseContains = _.rest(function (response, searchStrings) {
      var responseData = _.get(response, 'data');
      if (!responseData) {
        return false;
      }
      var responseDataString = JSON.stringify(responseData);
      return _.some(searchStrings, function (searchString) {
        return _.includes(responseDataString, searchString);
      });
    });

    return {
      responseError: function (response) {
        if (hasAlreadyRetried(response)) {
          return $q.reject(response);
        }

        // injected manually to get around circular dependency problem with $translateProvider
        // http://stackoverflow.com/questions/20647483/angularjs-injecting-service-into-a-http-interceptor-circular-dependency/21632161
        var Auth = $injector.get('Auth');
        if (isHttpAuthorizationError(response)) {
          Log.warn('Refresh access token due to HTTP authentication error.', response);
          return refreshTokenAndRetry(response, Auth);
        }
        if (isCIInvalidAccessTokenError(response)) {
          Log.warn('Refresh access token due to invalid CI error.', response);
          return refreshTokenAndRetry(response, Auth);
        }

        if (refreshTokenIsExpiredOrInvalid(response)) {
          Log.warn('Refresh-token is expired or invalid.', response);
          return Auth.logout();
        }


        return $q.reject(response);
      },
    };

    function refreshTokenAndRetry(response, Auth) {
      _.set(response, HAS_RETRIED, true);
      return Auth.refreshAccessTokenAndResendRequest(response);
    }

    function hasAlreadyRetried(response) {
      return _.get(response, HAS_RETRIED, false);
    }

    function isHttpAuthorizationError(response) {
      return response.status == 401 && responseContains(response, 'This request requires HTTP authentication', 'Request unauthorized', '200001');
    }

    function isCIInvalidAccessTokenError(response) {
      return response.status == 400 && responseContains(response, 'Invalid access token');
    }

    function refreshTokenIsExpiredOrInvalid(response) {
      return response.status == 400 && responseContains(response, 'The refresh token provided is expired', 'The requested scope is invalid');
    }
  }
})();
