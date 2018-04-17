(function () {
  'use strict';

  module.exports = wx2AdminWebClientApp;

  /* @ngInject */
  function wx2AdminWebClientApp($animate, $document, $interval, $location, $rootScope, $state, $timeout, $translate, $window, Auth, Authinfo, Config,
    HealthService, IdleTimeoutService, Localize, Log, LogMetricsService, MetricsService, OnlineUpgradeService, PreviousState, SecurityPolicyViolationService, SessionStorage,
    StorageKeys, TokenService, TrackingId, Utils, TOSService, WindowEventService) {
    //Expose the localize service globally.
    $rootScope.Localize = Localize;
    $rootScope.Utils = Utils;
    $rootScope.services = [];
    $rootScope.exporting = false;
    var LOGIN_STATE = 'login';

    function timeoutReportLoadingMetrics() {
      $timeout(MetricsService.reportLoadingMetrics.bind(MetricsService));
    }
    if ($document.readyState === 'complete') {
      timeoutReportLoadingMetrics();
    } else {
      WindowEventService.registerEventListener('load', timeoutReportLoadingMetrics);
    }

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
    SecurityPolicyViolationService.init();

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
      var oauthCodeParams = Utils.getFromStandardGetParams($window.document.URL);
      var accessTokenParams = Utils.getFromGetParams($window.document.URL);
      if (_.has(accessTokenParams, 'access_token')) {
        $rootScope.status = 'loaded';
        TokenService.setAccessToken(accessTokenParams.access_token);
      } else if (_.has(oauthCodeParams, 'code')) {
        $rootScope.status = 'loading';
        Auth.getNewAccessToken(oauthCodeParams)
          .then(function (token) {
            Log.debug('Got new access token: ' + token);
            $rootScope.status = 'loaded';
            TokenService.setAccessToken(token);
            $rootScope.$broadcast('ACCESS_TOKEN_RETRIEVED');
          }, function () {
            Auth.redirectToLogin();
          });
      } else if (_.has(oauthCodeParams, 'error')) {
        var error = oauthCodeParams.error;
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
      // TrackingId is generated/incremented on each request
      // Clear the current TrackingId when a new state is loaded
      TrackingId.clear();
      LogMetricsService.logMetricsState(toState);

      PreviousState.set(fromState.name);
      PreviousState.setParams(fromParams);

      // Add Body Class to the $rootScope on stateChange
      $rootScope.bodyClass = _.get(toState, 'data.bodyClass') || _.replace(toState.name, /\./g, '-') + '-state';
    });
  }
})();
