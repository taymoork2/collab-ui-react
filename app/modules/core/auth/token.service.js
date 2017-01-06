(function () {
  'use strict';

  module.exports = angular
    .module('core.token', [
      require('angular-cookies'),
      require('modules/core/config/config'),
      require('modules/core/scripts/services/storage'),
      require('modules/core/scripts/services/sessionstorage'),
      require('modules/core/config/oauthConfig'),
      require('modules/core/window').default,
    ])
    .service('TokenService', TokenService)
    .name;

  /* @ngInject */
  function TokenService($cookies, $injector, $rootScope, $window, OAuthConfig, Config, Storage, SessionStorage, WindowLocation, WindowService) {
    var respondSessionStorageEvent = 'sessionStorage' + Config.getEnv();
    var requestSessionStorageEvent = 'getSessionStorage' + Config.getEnv();
    var logoutEvent = 'logout' + Config.getEnv();
    var service = {
      getAccessToken: getAccessToken,
      getRefreshToken: getRefreshToken,
      getClientSessionId: getClientSessionId,
      getOrGenerateClientSessionId: getOrGenerateClientSessionId,
      setAccessToken: setAccessToken,
      setRefreshToken: setRefreshToken,
      setClientSessionId: setClientSessionId,
      setAuthorizationHeader: setAuthorizationHeader,
      completeLogout: completeLogout,
      clearStorage: clearStorage,
      triggerGlobalLogout: triggerGlobalLogout,
      init: init
    };

    var ACCESS_TOKEN = 'accessToken';
    var REFRESH_TOKEN = 'refreshToken';
    var LOGOUT = 'logout';
    var FOOBAR = 'foobar';
    var CLIENT_SESSION_ID = 'clientSessionId';
    var CLIENT_SESSION_COOKIE_DURATION = 3;
    var MONTHS = 'months';

    return service;

    function init() {
      // listen for changes to localStorage
      WindowService.registerEventListener('storage', sessionTokenTransfer);

      // If no sessionStorage tokens and the tab was not logged out, ask other tabs for the sessionStorage
      if (!$window.sessionStorage.length && !$window.sessionStorage.getItem(LOGOUT)) {
        $window.localStorage.setItem(requestSessionStorageEvent, FOOBAR);
        $window.localStorage.removeItem(requestSessionStorageEvent, FOOBAR);
      }
    }

    function getAccessToken() {
      return SessionStorage.get(ACCESS_TOKEN);
    }

    function getRefreshToken() {
      return SessionStorage.get(REFRESH_TOKEN);
    }

    function setAccessToken(token) {
      return SessionStorage.put(ACCESS_TOKEN, token);
    }

    function setRefreshToken(token) {
      return SessionStorage.put(REFRESH_TOKEN, token);
    }

    function setClientSessionId(sessionId) {
      $cookies.put(CLIENT_SESSION_ID, sessionId, {
        expires: moment().add(CLIENT_SESSION_COOKIE_DURATION, MONTHS).toDate()
      });
    }

    function getClientSessionId() {
      return $cookies.get(CLIENT_SESSION_ID);
    }

    function getOrGenerateClientSessionId() {
      var clientSessionId = getClientSessionId();
      if (!clientSessionId) {
        var uuid = require('uuid');
        clientSessionId = uuid.v4();
      }
      // set or renew the 3 month cookie - refresh token is only valid for 2 months
      setClientSessionId(clientSessionId);
      return clientSessionId;
    }

    function setAuthorizationHeader(token) {
      $injector.get('$http').defaults.headers.common.Authorization = 'Bearer ' + (token || getAccessToken());
    }

    function completeLogout(redirectUrl) {
      clearStorage();
      // We store a key value in sessionStorage to
      // prevent a login when multiple tabs are open
      SessionStorage.put(LOGOUT, LOGOUT);
      WindowLocation.set(redirectUrl);
    }

    function triggerGlobalLogout() {
      $window.localStorage.setItem(logoutEvent, LOGOUT);
      $window.localStorage.removeItem(logoutEvent, LOGOUT);
    }

    function clearStorage() {
      Storage.clear();
      SessionStorage.clear();
    }

    // This function transfers sessionStorage from one tab to another in the case another tab is logged in
    function sessionTokenTransfer(event) {
      if (!event.newValue) return;
      if (event.key === requestSessionStorageEvent) {
        // a tab asked for the sessionStorage, so send it
        $window.localStorage.setItem(respondSessionStorageEvent, JSON.stringify($window.sessionStorage));
        $window.localStorage.removeItem(respondSessionStorageEvent);
      } else if (event.key === logoutEvent) {
        completeLogout(OAuthConfig.getLogoutUrl());
      } else if (event.key === respondSessionStorageEvent && !$window.sessionStorage.length) {
        // a tab sent data, so get it
        var data = JSON.parse(event.newValue);
        for (var key in data) {
          $window.sessionStorage.setItem(key, data[key]);
        }

        if (getAccessToken() && (getAccessToken() !== '')) {
          setAuthorizationHeader();
          $rootScope.$broadcast('ACCESS_TOKEN_RETRIEVED');
        }
      }
    }
  }
})();
