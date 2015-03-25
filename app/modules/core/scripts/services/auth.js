'use strict';

angular
  .module('Core')
  .factory('Auth', Auth);

/* @ngInject */
function Auth($injector, $translate, $location, $timeout, $window, $q, Log, Config, SessionStorage, Authinfo, Utils, Storage, $rootScope) {
  var auth = {
    authorizeUrl: Config.getAdminServiceUrl(),
    oauthUrl: Config.oauthUrl.oauth2Url
  };

  auth.getAccount = function (org) {
    var $http = $injector.get('$http');
    var accountUrl = Config.getAdminServiceUrl();
    var url = accountUrl + 'organization/' + org + '/accounts';
    return $http.get(url);
  };

  auth.authorize = function (token) {
    var $http = $injector.get('$http');
    $http.defaults.headers.common.Authorization = 'Bearer ' + token;

    var currentOrgId = SessionStorage.get('customerOrgId');
    var partnerOrgId = SessionStorage.get('partnerOrgId');

    var orgId = null;
    var authUrl = null;

    if (currentOrgId) {
      authUrl = auth.authorizeUrl + 'organization/' + currentOrgId + '/userauthinfo';
      orgId = currentOrgId;
    } else if (partnerOrgId) {
      authUrl = auth.authorizeUrl + 'organization/' + partnerOrgId + '/userauthinfo?launchpartnerorg=true';
      orgId = partnerOrgId;
    } else {
      authUrl = auth.authorizeUrl + 'userauthinfo';
    }
    return $http.get(authUrl)
      .then(function (response) {
        Authinfo.initialize(response.data);
        if (Authinfo.isAdmin()) {
          return auth.getAccount(Authinfo.getOrgId())
            .success(function (data, status) {
              Authinfo.updateAccountInfo(data, status);
            });
        }
      })
      .catch(function (response) {
        Authinfo.clear();
        var error = $translate.instant('errors.serverDown');
        if (response) {
          if (response.status === 403) {
            error = $translate.instant('errors.status403');
          } else if (response.status === 401) {
            error = $translate.instant('errors.status401');
          }
        }
        return $q.reject(error);
      });
  };

  auth.getFromGetParams = function (url) {
    var result = {};
    var cleanUrlA = url.split('#');
    var cleanUrl = cleanUrlA[1];
    for (var i = 2; i < cleanUrlA.length; i++) {
      cleanUrl += '#' + cleanUrlA[i];
    }
    var params = cleanUrl.split('&');
    for (i = 0; i < params.length; i++) {
      var param = params[i];
      result[param.split('=')[0]] = param.split('=')[1];
    }
    return result;
  };

  auth.getFromStandardGetParams = function (url) {
    var result = {};
    var cleanUrlA = url.split('?');
    var cleanUrl = cleanUrlA[1];
    var params = cleanUrl.split('&');
    for (var i = 0; i < params.length; i++) {
      var param = params[i];
      result[param.split('=')[0]] = param.split('=')[1];
    }
    return result;
  };

  auth.getNewAccessToken = function (code) {
    var $http = $injector.get('$http');
    var deferred = $q.defer();
    var token = Config.getOAuthClientRegistrationCredentials();
    var data = Config.getOauthCodeUrl(code) + Config.oauthClientRegistration.scope + '&' + Config.getRedirectUrl();
    $http({
        method: 'POST',
        url: auth.oauthUrl + 'access_token',
        data: data,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + token
        }
      })
      .success(function (data) {
        deferred.resolve(data);
      })
      .error(function (data, status) {
        Log.error('Failed to obtain new oauth access_token.  Status: ' + status + ' Error: ' + data.error + ', ' + data.error_description);
        deferred.reject('Token request failed: ' + data.error_description);
      });
    return deferred.promise;
  };

  auth.refreshAccessToken = function (refresh_tok) {
    var $http = $injector.get('$http');
    var data = Config.getOauthAccessCodeUrl(refresh_tok);
    var cred = Config.getOAuthClientRegistrationCredentials();
    return $http({
      method: 'POST',
      url: auth.oauthUrl + 'access_token',
      data: data,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + cred
      }
    });
  };

  auth.setAccessToken = function () {
    var deferred = $q.defer();
    var $http = $injector.get('$http');
    var token = Utils.Base64.encode(Config.oauthClientRegistration.id + ':' + Config.oauthClientRegistration.secret);
    var data = Config.oauthUrl.oauth2ClientUrlPattern + Config.oauthClientRegistration.scope;
    $http({
        method: 'POST',
        url: auth.oauthUrl + 'access_token',
        data: data,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + token
        }
      })
      .success(function (data) {
        $rootScope.token = data.access_token;
        $http.defaults.headers.common.Authorization = 'Bearer ' + $rootScope.token;
        deferred.resolve(data.access_token);
      })
      .error(function (data, status) {
        Log.error('Failed to obtain oauth access_token.  Status: ' + status + ' Error: ' + data.error + ', ' + data.error_description);
        deferred.reject('Token request failed: ' + data.error_description);
      });
    return deferred.promise;
  };

  auth.refreshAccessTokenAndResendRequest = function (response) {
    var refresh_token = Storage.get('refreshToken');
    return this.refreshAccessToken(refresh_token)
      .then(function (response) {
        var $http = $injector.get('$http');
        Storage.put('accessToken', response.data.access_token);
        $rootScope.token = response.data.access_token;
        $http.defaults.headers.common.Authorization = 'Bearer ' + $rootScope.token;
        response.config.headers.Authorization = 'Bearer ' + $rootScope.token;
        return $http(response.config);
      });
  };

  auth.logout = function () {
    Storage.clear();
    Log.debug('Redirecting to logout url.');
    $window.location.href = Config.getLogoutUrl();
  };

  auth.isLoggedIn = function () {
    return Storage.get('accessToken');
  };

  auth.isUserAdmin = function () {
    return Authinfo.getRoles().indexOf('Full_Admin') > -1;
  };

  auth.redirectToLogin = function () {
    $window.location.href = Config.getOauthLoginUrl();
  };

  return auth;
}
