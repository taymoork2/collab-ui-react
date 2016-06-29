(function () {
  'use strict';

  module.exports = angular
    .module('core.token', [
      require('modules/core/config/config'),
      require('modules/core/scripts/services/sessionstorage'),
    ])
    .service('TokenService', TokenService)
    .name;

  /* @ngInject */
  function TokenService($injector, $rootScope, $window, Config, SessionStorage) {
    var respondSessionStorageEvent = 'sessionStorage' + Config.getEnv();
    var requestSessionStorageEvent = 'getSessionStorage' + Config.getEnv();
    var service = {
      getAccessToken: getAccessToken,
      getRefreshToken: getRefreshToken,
      setAccessToken: setAccessToken,
      setRefreshToken: setRefreshToken,
      setAuthorizationHeader: setAuthorizationHeader,
      init: init
    };

    return service;

    function init() {
      // listen for changes to localStorage
      $window.addEventListener('storage', sessionTokenTransfer);

      // If no sessionStorage tokens, ask other tabs for the sessionStorage
      if (!$window.sessionStorage.length) {
        $window.localStorage.setItem(requestSessionStorageEvent, 'foobar');
        $window.localStorage.removeItem(requestSessionStorageEvent, 'foobar');
      }
    }

    function getAccessToken() {
      return SessionStorage.get('accessToken');
    }

    function getRefreshToken() {
      return SessionStorage.get('refreshToken');
    }

    function setAccessToken(token) {
      return SessionStorage.put('accessToken', token);
    }

    function setRefreshToken(token) {
      return SessionStorage.put('refreshToken', token);
    }

    function setAuthorizationHeader(token) {
      $injector.get('$http').defaults.headers.common.Authorization = 'Bearer ' + (token || getAccessToken());
    }

    // This function transfers sessionStorage from one tab to another in the case another tab is logged in
    function sessionTokenTransfer(event) {
      if (!event.newValue) return;
      if (event.key === requestSessionStorageEvent) {
        // a tab asked for the sessionStorage, so send it
        $window.localStorage.setItem(respondSessionStorageEvent, JSON.stringify($window.sessionStorage));
        $window.localStorage.removeItem(respondSessionStorageEvent);
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
