(function () {
  'use strict';

  module.exports = wx2AdminWebClientApp;

  /* @ngInject */
  function wx2AdminWebClientApp($animate, $interval, $location, $rootScope, $state, $translate, $window, Auth, Authinfo, Config,
    HealthService, IdleTimeoutService, Localize, Log, LogMetricsService, OnlineUpgradeService, PreviousState, SessionStorage,
    StorageKeys, TokenService, TrackingId, Utils, TOSService) {
    //Expose the localize service globally.
    $rootScope.Localize = Localize;
    $rootScope.Utils = Utils;
    $rootScope.services = [];
    $rootScope.exporting = false;
    var LOGIN_STATE = 'login';

    setNewRelicRouteName(LOGIN_STATE);

    $rootScope.typeOfExport = {
      USER: 1,
      CUSTOMER: 2,
    };
    $window.$state = $state;
    //Enable logging
    $rootScope.debug = false;

    TokenService.init();
    TokenService.setAuthorizationHeader();

    IdleTimeoutService.init();

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
          } else {
            TOSService.hasAcceptedTOS()
                .then(function (acceptedTOS) {
                  if (OnlineUpgradeService.shouldForceUpgrade()) {
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
          }
        } else {
          e.preventDefault();
          SessionStorage.put(StorageKeys.REQUESTED_STATE_NAME, to.name);
          SessionStorage.putObject(StorageKeys.REQUESTED_STATE_PARAMS, toParams);
          SessionStorage.putObject(StorageKeys.REQUESTED_QUERY_PARAMS, $location.search());
          HealthService.getHealthStatus()
            .then(function () {
              $state.go(LOGIN_STATE);
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
      } else if ($window.document.URL.indexOf('error') !== -1) {
        params = getFromStandardGetParams($window.document.URL);
        var error = params.error;
        if (error === Config.oauthError.unauthorizedClient || error === Config.oauthError.invalidScope || error === Config.oauthError.unsupportedResponseType) {
          $state.go('login');
        } else if (error === Config.oauthError.accessDenied) {
          $state.go('unauthorized');
        } else if (error === Config.oauthError.serverError || error === Config.oauthError.temporarilyUnavailable || error === Config.oauthError.serviceUnavailable) {
          $state.go('backend-temp-unavailable');
        }
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
      setNewRelicRouteName(toState.name);

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

    function setNewRelicRouteName(name) {
      if (typeof newrelic !== 'undefined') {
        /* global newrelic */
        newrelic.setCurrentRouteName(name);
      }
    }
  }
})();
