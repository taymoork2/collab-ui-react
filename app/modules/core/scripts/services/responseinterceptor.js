(function () {
  'use strict';

  angular
    .module('Core')
    .factory('ResponseInterceptor', ResponseInterceptor);

  /* @ngInject */
  function ResponseInterceptor($injector, $q, $rootScope, Storage, Utils, Config, Log, Auth) {

    return {
      responseError: function (response) {
        if (is20001Error(response) || isHttpAuthError(response) || isCIInvalidAccessTokenError(response)) {
          return Auth.refreshAccessTokenAndResendRequest(response);
        }

        if (Storage.get('refreshToken') && refreshTokenHasExpired(response)) {
          Auth.logout();
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

    function responseContains(response, searchString) {
      if (!response || !response.data) {
        return false;
      }
      var responseData = JSON.stringify(response.data);
      return responseData.indexOf(searchString) != -1;
    }
  }
})();
