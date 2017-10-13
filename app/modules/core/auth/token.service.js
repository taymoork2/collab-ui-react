(function () {
  'use strict';

  module.exports = angular
    .module('core.auth.token', [
      require('angular-cookies'),
      require('modules/core/config/config').default,
      require('modules/core/storage').default,
      require('modules/core/config/oauthConfig'),
      require('modules/core/window').default,
    ])
    .service('TokenService', TokenService)
    .name;

  /* @ngInject */
  function TokenService($cookies, $injector, $rootScope, $window, OAuthConfig, Config, LocalStorage, SessionStorage, WindowLocation, WindowEventService) {
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
      init: init,
    };

    var ACCESS_TOKEN = 'accessToken';
    var REFRESH_TOKEN = 'refreshToken';
    var LOGOUT = 'logout';
    var FOOBAR = 'foobar';
    var CLIENT_SESSION_ID = 'clientSessionId';
    var CLIENT_SESSION_COOKIE_DURATION = 3;
    var MONTHS = 'months';
    var LOGIN_MESSAGE = 'loginMessage';

    return service;

    function init() {
      // listen for changes to localStorage
      WindowEventService.registerEventListener('storage', sessionTokenTransfer);

      // If no sessionStorage tokens and the tab was not logged out, ask other tabs for the sessionStorage
      if (!$window.sessionStorage.length && !$window.sessionStorage.getItem(LOGOUT)) {
        LocalStorage.put(requestSessionStorageEvent, FOOBAR);
        LocalStorage.remove(requestSessionStorageEvent, FOOBAR);
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
        expires: moment().add(CLIENT_SESSION_COOKIE_DURATION, MONTHS).toDate(),
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

    function completeLogout(redirectUrl, loginMessage) {
      loginMessage = loginMessage || LocalStorage.get(LOGIN_MESSAGE);
      clearStorage();
      // We store a key value in sessionStorage to
      // prevent a login when multiple tabs are open
      SessionStorage.put(LOGOUT, LOGOUT);
      WindowLocation.set(redirectUrl);
      LocalStorage.put(LOGIN_MESSAGE, loginMessage);
    }

    function triggerGlobalLogout(loginMessage) {
      LocalStorage.put(logoutEvent, LOGOUT);
      LocalStorage.remove(logoutEvent, LOGOUT);
      LocalStorage.put(LOGIN_MESSAGE, loginMessage);
    }

    function clearStorage() {
      LocalStorage.clear();
      SessionStorage.clear();
    }

    // This function transfers sessionStorage from one tab to another in the case another tab is logged in
    function sessionTokenTransfer(event) {
      if (!event.newValue) return;
      if (event.key === requestSessionStorageEvent) {
        // a tab asked for the sessionStorage, so send it
        LocalStorage.putObject(respondSessionStorageEvent, $window.sessionStorage);
        LocalStorage.remove(respondSessionStorageEvent);
      } else if (event.key === logoutEvent) {
        completeLogout(OAuthConfig.getLogoutUrl());
      } else if (event.key === respondSessionStorageEvent && !$window.sessionStorage.length) {
        // a tab sent data, so get it
        var data = JSON.parse(event.newValue);
        for (var key in data) {
          SessionStorage.put(key, data[key]);
        }

        if (getAccessToken() && (getAccessToken() !== '')) {
          setAuthorizationHeader();
          $rootScope.$broadcast('ACCESS_TOKEN_RETRIEVED');
        }
      }
    }
  }
})();
