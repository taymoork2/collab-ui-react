(function () {
  'use strict';

  angular
    .module('Core')
    .factory('ResponseInterceptor', ResponseInterceptor);

  /* @ngInject */
  function ResponseInterceptor($injector, $q, $rootScope, Storage, Utils, Config, Log, $window) {
    return {
      responseError: function (response) {
        if ((response.status === 401 && response.data && response.data.Errors &&
            response.data.Errors[0].errorCode === '200001') ||
          (response.status === 401 && response.data && response.data !== '' &&
            response.data.indexOf('This request requires HTTP authentication.') !== -1)) {

          // first refresh the CI token then resend the request
          return refreshAccessToken(Storage.get('refreshToken'))
            .then(function (response) {
              Storage.put('accessToken', response.data.access_token);
              $rootScope.token = response.data.access_token;
              var $http = $injector.get('$http');
              $http.defaults.headers.common.Authorization = 'Bearer ' + $rootScope.token;
              response.config.headers.Authorization = 'Bearer ' + $rootScope.token;
              return $http(response.config);
            });

        } else if (Storage.get('refreshToken') && response.status === 400 && response.data &&
          response.data.error_description && response.data.error_description.indexOf('The refresh token provided is expired') !== -1) {
          logout();
        } else {
          return $q.reject(response);
        }
      }
    };

    function refreshAccessToken(refresh_tok) {
      var cred = Utils.Base64.encode(Config.oauthClientRegistration.id + ':' + Config.oauthClientRegistration.secret);
      var data = Config.getOauthAccessCodeUrl(refresh_tok) + Config.oauthClientRegistration.scope;

      var $http = $injector.get('$http');
      return $http({
        method: 'POST',
        url: Config.oauthUrl.oauth2Url + 'access_token',
        data: data,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + cred
        }
      });
    }

    function logout() {
      Storage.clear();
      Log.debug('Redirecting to logout url.');
      $window.location.href = Config.getLogoutUrl();
    }

  }
})();
