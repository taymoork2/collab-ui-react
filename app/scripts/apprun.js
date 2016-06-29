(function () {
  'use strict';

  module.exports = wx2AdminWebClientApp;

  /* @ngInject */
  function wx2AdminWebClientApp($animate, $location, $rootScope, Auth, Authinfo, Localize, Utils, Log, $interval, Config, $state, $window, SessionStorage, $translate, LogMetricsService, PreviousState, Localytics, TokenService, TrackingId) {
    //Expose the localize service globally.
    $rootScope.Localize = Localize;
    $rootScope.Utils = Utils;
    $rootScope.services = [];
    $rootScope.exporting = false;

    $rootScope.typeOfExport = {
      USER: 1,
      CUSTOMER: 2
    };
    $window.$state = $state;
    //Enable logging
    $rootScope.debug = false;

    var storedState = 'storedState';
    var storedParams = 'storedParams';
    var queryParams = 'queryParams';

    TokenService.init();
    TokenService.setAuthorizationHeader();

    Config.setTestEnvConfig($location.search()['test-env-config']);

    if (Config.isE2E()) {
      $animate.enabled(false);
    }

    $rootScope.$on('$stateChangeStart', function (e, to, toParams) {
      if (typeof to.authenticate === 'undefined' || to.authenticate) {
        if (Authinfo.isInitialized()) {
          if (!Authinfo.isAllowedState(to.name)) {
            e.preventDefault();
            $state.go('unauthorized');
          } else if (!Authinfo.isSetupDone() && Authinfo.isCustomerAdmin() && to.name !== 'firsttimewizard') {
            e.preventDefault();
            $state.go('firsttimewizard');
          }
        } else {
          e.preventDefault();
          SessionStorage.put(storedState, to.name);
          SessionStorage.putObject(storedParams, toParams);
          SessionStorage.putObject(queryParams, $location.search());
          $state.go('login');
        }
      }
    });

    $rootScope.status = 'init';

    if (!TokenService.getAccessToken()) {
      var params;
      if ($window.document.URL.indexOf('access_token') !== -1) {
        params = getFromGetParams($window.document.URL);
        $rootScope.status = 'loaded';
        TokenService.setAccessToken(params.access_token);
      } else if ($window.document.URL.indexOf('code') !== -1) {
        params = getFromStandardGetParams($window.document.URL);
        $rootScope.status = 'loading';
        Auth.getNewAccessToken(params)
          .then(function (token) {
            Log.debug('Got new access token: ' + token);
            $rootScope.status = 'loaded';
            TokenService.setAccessToken(token);
            $rootScope.$broadcast('ACCESS_TOKEN_RETRIEVED');
          }, function () {
            Auth.redirectToLogin();
          });
      } else {
        Log.debug('No access code data.');
      }
    }

    var refreshToken = function () {
      $interval(function () {
        Auth.refreshAccessToken();
      }, Config.tokenTimers.refreshTimer);
    };

    var delay = $interval(function () {
        $interval.cancel(delay);
        if (TokenService.getAccessToken()) {
          Log.debug('starting refresh timer...');
          //start refresh cycle after 15 minutes
          refreshToken();
        } else {
          Auth.redirectToLogin();
        }
      },
      Config.tokenTimers.refreshDelay
    );

    $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
      // TrackingId is generated/incremented on each request
      // Clear the current TrackingId when a new state is loaded
      TrackingId.clear();
      LogMetricsService.logMetricsState(toState);

      PreviousState.set(fromState.name);
      PreviousState.setParams(fromParams);

      Localytics.tagScreen(toState.name);

      // Add Body Class to the $rootScope on stateChange
      $rootScope.bodyClass = _.get(toState, 'data.bodyClass') || toState.name.replace(/\./g, '-') + '-state';
    });

    function getFromStandardGetParams(url) {
      var result = {};
      var cleanUrlA = url.split('?');
      var cleanUrl = cleanUrlA[1];
      var params = cleanUrl.split('&');
      for (var i = 0; i < params.length; i++) {
        var param = params[i];
        result[param.split('=')[0]] = param.split('=')[1];
      }
      return result;
    }

    function getFromGetParams(url) {
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
    }
  }
}());
