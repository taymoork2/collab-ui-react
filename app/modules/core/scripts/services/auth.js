'use strict';

angular.module('Core')
  .factory('Auth', ['$http', '$filter', '$location', '$timeout', '$window', '$q', 'Log', 'Config', 'Authinfo', 'Utils', 'Storage', '$rootScope', '$dialogs',
    function($http, $filter, $location, $timeout, $window, $q, Log, Config, Authinfo, Utils, Storage, $rootScope, $dialogs) {
    var progress = 0;
    var auth = {
      authorizeUrl: Config.getAdminServiceUrl() + 'userauthinfo',
      oauthUrl: Config.oauth2Url,
      allowedPaths: Config.allowedPaths
    };

    var ciErrorMsg = 'Sorry, you don\'t have sufficient privileges';

    auth.isLoggedIn = function() {
      if (Storage.get('accessToken')) {
        return true;
      } else {
        return false;
      }
    };

    auth.isAllowedPath = function() {
      var currentPath = $location.path();
      for (var idx in auth.allowedPaths) {
        if (auth.allowedPaths[idx] === currentPath) {
          return true;
        }
      }
      return false;
    };

    auth.authorize = function(token, scope) {
      var deferred = $q.defer();
      $http.defaults.headers.common.Authorization = 'Bearer ' + token;
      $http.get(auth.authorizeUrl)
        .success(function(data) {
          scope.isAuthorized = true;
          Authinfo.initialize(data);
          deferred.resolve();
        })
        .error(function(data, status) {
          Authinfo.clear();
          scope.isAuthorized = false;
          scope.data = data || 'Authorization failed.';
          if (status === 403) {
            scope.result = $filter('translate')('errors.status403');
          } else if (status === 401) {
            scope.result = $filter('translate')('errors.status401');
          } else {
            scope.result = $filter('translate')('errors.serverDown');
          }
          deferred.reject();
          $timeout(auth.logout, 5000);
        });

      return deferred.promise;

    };

    auth.getFromGetParams = function(url) {
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

    auth.getFromStandardGetParams = function(url) {
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

    auth.getAccessToken = function() {
      var deferred = $q.defer();
      var token = Utils.Base64.encode(Config.oauthClientRegistration.id + ':' + Config.oauthClientRegistration.secret);
      var data = 'grant_type=client_credentials&scope=' + Config.oauthClientRegistration.scope;

      $http({
        method: 'POST',
        url: auth.oauthUrl + 'access_token',
        data: data,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + token
        }
      })
        .success(function(data) {
          deferred.resolve(data.access_token);
        })
        .error(function(data, status) {
          Log.error('Failed to obtain oauth access_token.  Status: ' + status + ' Error: ' + data.error + ', ' + data.error_description);
          deferred.reject('Token request failed: ' + data.error_description);
        });

      return deferred.promise;
    };

    auth.isAuthorized = function(scope) {
      if (!Authinfo.isEmpty()) {
        //Check if this is an allowed tab
        if (!Authinfo.isAllowedTab()) {
          $location.path('/unauthorized');
        }
        return true;
      } else {
        var token = Storage.get('accessToken');
        if (token) {
          Log.debug('Authorizing user... Populating admin data...');
          this.authorize(token, scope);
        } else {
          $location.path('/login');
        }
      }
    };

    auth.logout = function() {
      Storage.clear();
      $rootScope.loggedIn = false;
      Log.debug('Redirecting to logout url.');
      $window.location.href = Config.getLogoutUrl();
    };

    auth.isUserAdmin = function() {
      if (Authinfo.getRoles().indexOf('Full_Admin') > -1) {
        return true;
      } else {
        return false;
      }
    };

    auth.handleStatus = function(status, description) {
      if ((status === 401 && description !== ciErrorMsg) || status === 403) {
        console.log('Token is not authorized or invalid. Logging user out.');
        $dialogs.wait(undefined, $filter('translate')('errors.expired') , progress);
        this.delayedLogout();
      }
    };

    auth.delayedLogout = function() {
      $timeout(function(){
        if(progress<100){
          progress+=10;
          $rootScope.$broadcast('dialogs.wait.progress', {'progress': progress});
          auth.delayedLogout();
        } else {
          $rootScope.$broadcast('dialogs.wait.complete');
          progress = 0;
          auth.logout();
        }
      }, 1000);
    };

    return auth;

  }]);
