'use strict';
angular.module('Core')
  .factory('Auth', ['$http', '$translate', '$location', '$timeout', '$window', '$q', 'Log', 'Config', 'SessionStorage', 'Authinfo', 'Utils', 'Storage', '$rootScope', '$dialogs', 'AccountService',
    function ($http, $translate, $location, $timeout, $window, $q, Log, Config, SessionStorage, Authinfo, Utils, Storage, $rootScope, $dialogs, AccountService) {
      var progress = 0;
      var auth = {
        authorizeUrl: Config.getAdminServiceUrl(),
        oauthUrl: Config.oauthUrl.oauth2Url
      };
      var ciErrorMsg = 'Sorry, you don\'t have sufficient privileges';
      auth.isLoggedIn = function () {
        if (Storage.get('accessToken')) {
          return true;
        } else {
          return false;
        }
      };

      auth.authorize = function (token) {
        var authUrl = null;
        $http.defaults.headers.common.Authorization = 'Bearer ' + token;
        var currentOrgId = SessionStorage.get('customerOrgId');
        var partnerOrgId = SessionStorage.get('partnerOrgId');
        var orgId = null;
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
            return AccountService.getAccount(Authinfo.getOrgId())
              .success(function (data, status) {
                Authinfo.updateAccountInfo(data, status);
              });
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
      auth.getAccessToken = function () {
        var deferred = $q.defer();
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
            deferred.resolve(data.access_token);
          })
          .error(function (data, status) {
            Log.error('Failed to obtain oauth access_token.  Status: ' + status + ' Error: ' + data.error + ', ' + data.error_description);
            deferred.reject('Token request failed: ' + data.error_description);
          });
        return deferred.promise;
      };
      auth.getNewAccessToken = function (code) {
        var deferred = $q.defer();
        var token = Utils.Base64.encode(Config.oauthClientRegistration.id + ':' + Config.oauthClientRegistration.secret);
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
      auth.RefreshAccessToken = function (refresh_tok) {
        var deferred = $q.defer();
        var cred = Utils.Base64.encode(Config.oauthClientRegistration.id + ':' + Config.oauthClientRegistration.secret);
        var data = Config.getOauthAccessCodeUrl(refresh_tok) + Config.oauthClientRegistration.scope;
        $http({
            method: 'POST',
            url: auth.oauthUrl + 'access_token',
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
            deferred.reject('Token request failed: ' + data.error_description);
          });
        return deferred.promise;
      };
      auth.logout = function () {
        Storage.clear();
        Log.debug('Redirecting to logout url.');
        $window.location.href = Config.getLogoutUrl();
      };
      auth.isUserAdmin = function () {
        if (Authinfo.getRoles().indexOf('Full_Admin') > -1) {
          return true;
        } else {
          return false;
        }
      };
      auth.handleStatus = function (status, description) {
        // if ((status === 401 && description !== ciErrorMsg) || status === 403) {
        //console.log('Token is not authorized or invalid. Logging user out.');
        // $dialogs.wait(undefined, $filter('translate')('errors.expired') , progress);
        // this.delayedLogout();
        // }
      };
      auth.delayedLogout = function () {
        $timeout(function () {
          if (progress < 100) {
            progress += 10;
            $rootScope.$broadcast('dialogs.wait.progress', {
              'progress': progress
            });
            auth.delayedLogout();
          } else {
            $rootScope.$broadcast('dialogs.wait.complete');
            progress = 0;
            auth.logout();
          }
        }, 1000);
      };
      auth.redirectToLogin = function () {
        var oauth2LoginUrl = Config.getOauthLoginUrl();
        //console.log('No accessToken.');
        $window.location.href = oauth2LoginUrl;
      };
      return auth;
    }
  ]);
