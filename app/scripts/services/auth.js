'use strict';

angular.module('wx2AdminWebClientApp')
  .factory('Auth', function($rootScope, $http, $location, $q, Log, Config, Utils, Storage) {

    var auth = {
      'clientID': 'C96d389d632c96d038d8f404c35904b5108988bd6d601d4b47f4eec88a569d5db',
      'clientSecret': 'b11c3e96a0d51f66ff9686220b74e2c0f6c6c7636bba98b71ca5dbbf5d6896d6',

      'authorizationUrl': 'https://idbrokerbeta.webex.com/idb/oauth2/v1/authorize?' +
        'response_type=code' +
        '&client_id=C96d389d632c96d038d8f404c35904b5108988bd6d601d4b47f4eec88a569d5db' +
        '&redirect_uri=urn%3Aietf%3Awg%3Aoauth%3A2.0%3Aoob' +
        '&scope=webexsquare%3Aget_conversation' +
        '&realm=1eb65fdf-9643-417f-9974-ad72cae0e10f' +
        '&state=random-string',

      'accessTokenUrl': 'https://idbrokerbeta.webex.com/idb/oauth2/v1/access_token',
    };

    auth.accessTokenKey = 'accessToken';
    auth.refreshTokenKey = 'refreshToken';
    auth.authToken = '';
    auth.authTokenAuthorizationHeader = null;


    auth.tryToAuthenticateUserByToken = function(callback) {
      // Read from the Cookie
      var cookieValue = document.cookie;
      var cookieName = 'authToken';
      var cookieStart = cookieValue.indexOf(' ' + cookieName + '=');

      if (cookieStart === -1) {
        cookieStart = cookieValue.indexOf(cookieName + '=');
      }

      if (cookieStart === -1) {
        cookieValue = null;
      } else {
        cookieStart = cookieValue.indexOf('=', cookieStart) + 1;
        var cookieEnd = cookieValue.indexOf(';', cookieStart);
        if (cookieEnd === -1) {
          cookieEnd = cookieValue.length;
        }
        cookieValue = encodeURI(cookieValue.substring(cookieStart, cookieEnd));
      }
      if (cookieValue && cookieValue !== '') {
        this.authToken = cookieValue;
        this.authTokenAuthorizationHeader = 'Basic ' + Utils.Base64.encode(this.authToken + ':');
        $http.defaults.headers.common.Authorization = this.authTokenAuthorizationHeader;
        $http.get(Config.conversationUrl + '/users')
          .success(function(data) {
            $rootScope.user = data;
            if (!$rootScope.userPromise) {
              $rootScope.userPromise = $q.defer();
            }
            $rootScope.userPromise.resolve();
            callback(true);
          })
          .error(function() {
            $location.path('/login');
            callback(false);
          });
      } else {
        callback(false);
      }
    };


    auth.saveToken = function(accessToken) {
      Storage.put(this.accessTokenKey, accessToken);
      Log.debug('Access Token Persisted');
    };


    auth.saveRefreshToken = function(refreshToken) {
      Storage.put(this.refreshTokenKey, refreshToken);
      Log.debug('Refresh Token Persisted');
    };


    auth.tryToAuthenticateUserByAccessToken = function(accessToken, callback) {
      this.saveToken(accessToken);

      this.authTokenAuthorizationHeader = 'Bearer ' + accessToken;
      Log.info('Access Token: ' + accessToken, accessToken);
      $http.defaults.headers.common.Authorization = this.authTokenAuthorizationHeader;
      $http.get(Config.conversationUrl + '/users')
        .success(function(data) {
          $rootScope.user = data;
          if (!$rootScope.userPromise) {
            $rootScope.userPromise = $q.defer();
          }
          $rootScope.userPromise.resolve();
          callback(true);
        })
        .error(function() {
          $location.path('/login');
          callback(false);
        });

    };


    auth.tryToAuthenticateBySavedAccessToken = function(callback) {
      var accessToken = Storage.get(this.accessTokenKey);
      if (accessToken && accessToken !== null) {
        this.tryToAuthenticateUserByAccessToken(accessToken, function(success) {
          callback(success);
        });
      } else {
        callback(false);
      }
    };


    auth.tryAuthByAccessToken = function(accessToken, callback) {
      this.authTokenAuthorizationHeader = 'Bearer ' + accessToken; // use this line for standard Bearer auth flow
      // this.authTokenAuthorizationHeader = "Bearer " + Utils.Base64.encode(accessToken);
      // this.authTokenAuthorizationHeader = accessToken;
      Log.info('Access Token: ' + accessToken, accessToken);
      $http.defaults.headers.common.Authorization = this.authTokenAuthorizationHeader;
      $http.get(Config.conversationUrl + '/users')
        .success(function(data) {
          $rootScope.user = data;
          if (!$rootScope.userPromise) {
            $rootScope.userPromise = $q.defer();
          }
          $rootScope.userPromise.resolve();
          callback(true);
        })
        .error(function() {
          $location.path('/login');
          callback(false);
        });
    };


    auth.obtainAuthorizationCode = function() {
      $http.get(auth.authorizationUrl)
        .success(function(data) {
          Log.info('Authorization Code Obtained', data);
        })
        .error(function(data, status, headers, config) {
          Log.error('Failed to Obtained Authorization Code', {
            data: data,
            status: status,
            headers: headers,
            config: config,
            url: auth.authorizationUrl,
          });
        });
    };


    auth.code2accessToken = function(code, callback) {
      Log.debug('Trying to have an access_code from code ' + code);
      var post = 'grant_type=authorization_code&redirect_uri=http%3A%2F%2F127.0.0.1%3A8000&code=' + code;
      $http({
        url: auth.accessTokenUrl,
        dataType: 'json',
        method: 'POST',
        data: post,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + Utils.Base64.encode(auth.clientID + ':' + auth.clientSecret),
        }
      }).success(function(data) {
        Log.debug('Access_code retrived', data);
        callback(data);
      }).error(function(data, status, headers, config) {
        Log.error('Failed to Obtain access_token from Code', {
          data: data,
          status: status,
          headers: headers,
          config: config,
        });
      });
    };


    auth.bearerAuthorizationHeader = function(accessToken) {
      return 'Bearer ' + Utils.Base64.encode(accessToken);
    };


    auth.refresh = function(refreshToken, callback) {
      Log.info('Refresh OAuth token ' + refreshToken);
      this.saveRefreshToken(refreshToken);
      $http.defaults.headers.common.Authorization = auth.authTokenAuthorizationHeader;
      callback(true, true);
    };


    auth.refreshBySavedRefreshToken = function(callback) {
      var refreshToken = Storage.get(this.refreshTokenKey);
      if (refreshToken && refreshToken !== null) {
        this.refresh(refreshToken, function(success, data) {
          callback(success, data);
        });
      } else {
        callback(false);
      }
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

    return auth;


  });
