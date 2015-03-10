(function () {
  'use strict';

  angular
    .module('Core')
    .factory('ResponseInterceptor', ResponseInterceptor);

  /* @ngInject */
  function ResponseInterceptor($injector, $q, $rootScope, Storage, Utils, Config, Log, $window) {
    return {
      response: function (response) {
        return response;
      },
      responseError: function (response) {
        if ((response.status === 401 && response.data && response.data.Errors &&
            response.data.Errors[0].errorCode === '200001') ||
          (response.status === 401 && response.data && response.data !== '' &&
            response.data.indexOf('This request requires HTTP authentication.') !== -1)) {

          var defer = $q.defer();
          var promiseSession = defer.promise;

          // first refresh the CI token then resend the request
          refreshAccessToken(Storage.get('refreshToken'))
            .then(function (adata) {
              Storage.put('accessToken', adata.access_token);
              defer.resolve();
            }, function (response) {
              defer.reject(response);
            });

          // and chain request
          var promiseUpdate = promiseSession.then(function () {
            var $http = $injector.get('$http');
            $rootScope.token = Storage.get('accessToken');
            $http.defaults.headers.common.Authorization = 'Bearer ' + $rootScope.token;
            response.config.headers.Authorization = 'Bearer ' + $rootScope.token;
            return $http(response.config);
          });
          return promiseUpdate;
        } else if (Storage.get('refreshToken') && response.status === 400 && response.data &&
          response.data.error_description && response.data.error_description.indexOf('The refresh token provided is expired') !== -1) {
          // alert('session expired, you will be forced to login again.');
          logout();
        } else {
          return $q.reject(response);
        }
      }
    };

    function refreshAccessToken(refresh_tok) {
      var deferred = $q.defer();
      var cred = Utils.Base64.encode(Config.oauthClientRegistration.id + ':' + Config.oauthClientRegistration.secret);
      var data = Config.getOauthAccessCodeUrl(refresh_tok) + Config.oauthClientRegistration.scope;

      var $http = $injector.get('$http');
      $http({
          method: 'POST',
          url: Config.oauthUrl.oauth2Url + 'access_token',
          data: data,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + cred
          }
        })
        .success(function (data) {
          deferred.resolve(data);
        })
        .error(function (data, status) {
          Log.error('Failed to refresh oauth access_token.  Status: ' + status + ' Error: ' + data.error + ', ' + data.error_description);
          deferred.reject(data);
        });

      return deferred.promise;
    }

    function logout() {
      Storage.clear();
      Log.debug('Redirecting to logout url.');
      $window.location.href = Config.getLogoutUrl();
    }

  }
})();
