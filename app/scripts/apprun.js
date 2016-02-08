'use strict';
angular
  .module('wx2AdminWebClientApp')
  .run(['$cookies', '$location', '$rootScope', 'Auth', 'Authinfo', 'Storage', 'Localize', 'Utils', 'HttpUtils', 'Log', '$interval', '$document', 'Config', '$state', 'SessionStorage', '$translate', 'LogMetricsService', '$log', 'formlyValidationMessages', 'PreviousState',
    function ($cookies, $location, $rootScope, Auth, Authinfo, Storage, Localize, Utils, HttpUtils, Log, $interval, $document, Config, $state, SessionStorage, $translate, LogMetricsService, $log, formlyValidationMessages, PreviousState) {
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

      Config.setProductionBackend($location.search().backend);

      $rootScope.$on('$stateChangeStart', function (e, to, toParams) {

        if (typeof to.authenticate === 'undefined' || to.authenticate) {
          if (Authinfo.isInitialized()) {
            if (!Authinfo.isAllowedState(to.name)) {
              e.preventDefault();
              $state.go('unauthorized');
            }
          } else {
            $rootScope.token = Storage.get('accessToken');
            e.preventDefault();
            if (!_.isEmpty($rootScope.token)) {
              Auth.authorize($rootScope.token)
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
        if (document.URL.indexOf('access_token') !== -1) {
          params = Auth.getFromGetParams(document.URL);
          $rootScope.status = 'loaded';
          Storage.put('accessToken', params.access_token);
          $rootScope.token = params.access_token;

        } else if (document.URL.indexOf('code') !== -1) {
          params = Auth.getFromStandardGetParams(document.URL);
          $rootScope.status = 'loading';
          Auth.getNewAccessToken(params.code)
            .then(function (data) {
              $rootScope.status = 'loaded';
              Storage.put('accessToken', data.access_token);
              Storage.put('refreshToken', data.refresh_token);
              $rootScope.token = data.access_token;
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
          Auth.refreshAccessToken(Storage.get('refreshToken'))
            .then(function (data) {
              Storage.put('accessToken', data.access_token);
              $rootScope.token = data.access_token;
            });
        }, Config.tokenTimers.refreshTimer); //11 hours
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
        Config.tokenTimers.refreshDelay); //15 minutes

      $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
        HttpUtils.setTrackingID();
        LogMetricsService.logMetricsState(toState);

        PreviousState.set(fromState.name);
        PreviousState.setParams(fromParams);

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
    }
  ]);
