(function () {
  'use strict';

  angular
    .module('wx2AdminWebClientApp')
    .run(wx2AdminWebClientApp);

  function wx2AdminWebClientApp($location, $rootScope, Auth, Authinfo, Storage, Localize, Utils, Log, $interval, $window, Config, $state, SessionStorage, $translate, LogMetricsService, $log, formlyValidationMessages, PreviousState, Localytics, TrackingId, $animate) {
    //Expose the localize service globally.
    $rootScope.Localize = Localize;
    $rootScope.Utils = Utils;
    $rootScope.services = [];
    $rootScope.exporting = false;

    $rootScope.typeOfExport = {
      USER: 1,
      CUSTOMER: 2
    };

    //Enable logging
    $rootScope.debug = false;

    var storedState = 'storedState';
    var storedParams = 'storedParams';
    var queryParams = 'queryParams';

    Auth.setAuthorizationHeader();

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
          if (!_.isEmpty(Storage.get('accessToken'))) {
            Auth.authorize()
              .then(function () {
                $state.go(to.name, toParams);
              })
              .catch(function () {
                SessionStorage.put(storedState, to.name);
                SessionStorage.putObject(storedParams, toParams);
                $state.go('login');
              });
          } else {
            SessionStorage.put(storedState, to.name);
            SessionStorage.putObject(storedParams, toParams);
            SessionStorage.putObject(queryParams, $location.search());
            $state.go('login');
          }
        }
      }
    });

    $rootScope.status = 'init';

    if (!Storage.get('accessToken')) {
      var params;
      if ($window.document.URL.indexOf('access_token') !== -1) {
        params = getFromGetParams($window.document.URL);
        $rootScope.status = 'loaded';
        Storage.put('accessToken', params.access_token);
      } else if ($window.document.URL.indexOf('code') !== -1) {
        params = getFromStandardGetParams($window.document.URL);
        $rootScope.status = 'loading';
        Auth.getNewAccessToken(params)
          .then(function (token) {
            Log.debug('Got new access token: ' + token);
            $rootScope.status = 'loaded';
            Storage.put('refreshToken', token);
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
        if (Storage.get('accessToken')) {
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

    // This is where standard form field validation messages are defined.  Any overrides need to be
    // done in individual controllers.  Using promise returned from $translate service to ensure
    // translation file is loaded before adding messages to formly.
    $translate('common.invalidRequired').then(function (requiredMessage) {
      formlyValidationMessages.addStringMessage('required', requiredMessage);
    });

    $translate('common.invalidEmail').then(function (emailMessage) {
      formlyValidationMessages.addStringMessage('email', emailMessage);
    });

    $translate('common.invalidUrl').then(function (urlMessage) {
      formlyValidationMessages.addStringMessage('url', urlMessage);
    });

    $translate('common.invalidPhoneNumber').then(function (phoneNumberMessage) {
      formlyValidationMessages.addStringMessage('phoneNumber', phoneNumberMessage);
    });

    formlyValidationMessages.messages.minlength = getMinLengthMessage;
    formlyValidationMessages.messages.maxlength = getMaxLengthMessage;
    formlyValidationMessages.messages.max = getMaxMessage;

    function getMinLengthMessage($viewValue, $modelValue, scope) {
      return $translate.instant('common.invalidMinLength', {
        min: scope.options.templateOptions.minlength
      });
    }

    function getMaxLengthMessage($viewValue, $modelValue, scope) {
      return $translate.instant('common.invalidMaxLength', {
        max: scope.options.templateOptions.maxlength
      });
    }

    function getMaxMessage($viewValue, $modelValue, scope) {
      return $translate.instant('common.invalidMax', {
        max: scope.options.templateOptions.max
      });
    }

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
