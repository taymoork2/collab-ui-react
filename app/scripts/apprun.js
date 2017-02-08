(function () {
  'use strict';

  module.exports = wx2AdminWebClientApp;

  /* @ngInject */
  function wx2AdminWebClientApp($animate, $interval, $location, $rootScope, $state, $translate, $window, Auth, Authinfo, Config,
    HealthService, IdleTimeoutService, Localize, Log, LogMetricsService, OnlineUpgradeService, PreviousState, SessionStorage,
    TokenService, TrackingId, Utils, TOSService) {
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

    IdleTimeoutService.init();

    Config.setTestEnvConfig($location.search()['test-env-config']);

    if (Config.isE2E()) {
      $animate.enabled(false);
    }

    // - DO NOT USE OR EXTEND THIS CODE - this code will be removed before 2/10/2017
    if (Config.isUserAgent('QtCarBrowser') || Config.isUserAgent('SMART-TV')) {
      $window.mixpanel.init('536df13b2664a85b06b0b6cf32721c24');
      $window.mixpanel.track('inside apprun.js');
    }

    $rootScope.$on('$stateChangeStart', function (e, to, toParams) {

      if (typeof to.authenticate === 'undefined' || to.authenticate) {
        if (Authinfo.isInitialized()) {

          TOSService.hasAcceptedTOS()
            .then(function (acceptedTOS) {
              if (!Authinfo.isAllowedState(to.name)) {
                e.preventDefault();
                $state.go('unauthorized');
              } else if (OnlineUpgradeService.shouldForceUpgrade()) {
                e.preventDefault();
                OnlineUpgradeService.openUpgradeModal();
              } else if (!acceptedTOS) {
                e.preventDefault();
                TOSService.openTOSModal();
              } else if (!Authinfo.isSetupDone() && Authinfo.isCustomerAdmin() && to.name !== 'firsttimewizard') {
                e.preventDefault();
                $state.go('firsttimewizard');
              }
            });
        } else {
          e.preventDefault();
          SessionStorage.put(storedState, to.name);
          SessionStorage.putObject(storedParams, toParams);
          SessionStorage.putObject(queryParams, $location.search());
          HealthService.getHealthStatus()
            .then(function (status) {
              if (status === 'online') {
                $state.go('login');
              }
            }).catch(function () {
              $state.go('server-maintenance');
            });
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

      // Add Body Class to the $rootScope on stateChange
      $rootScope.bodyClass = _.get(toState, 'data.bodyClass') || _.replace(toState.name, /\./g, '-') + '-state';
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
})();
