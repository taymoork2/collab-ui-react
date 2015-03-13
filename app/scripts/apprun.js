'use strict';
angular
  .module('wx2AdminWebClientApp')
  .run(['$cookies', '$location', '$rootScope', 'Auth', 'Authinfo', 'Storage', 'Localize', 'Utils', 'HttpUtils', 'Log', '$interval', '$document', 'Config', '$state', 'SessionStorage', '$translate',
    function ($cookies, $location, $rootScope, Auth, Authinfo, Storage, Localize, Utils, HttpUtils, Log, $interval, $document, Config, $state, SessionStorage, $translate) {
      //Expose the localize service globally.
      $rootScope.Localize = Localize;
      $rootScope.Utils = Utils;
      $rootScope.services = [];
      $rootScope.exporting = false;

      //Enable logging
      $rootScope.debug = false;

      var storedState = 'storedState';
      var storedParams = 'storedParams';
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
            if ($rootScope.token) {
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
          Auth.RefreshAccessToken(Storage.get('refreshToken'))
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

      $rootScope.$on('$stateChangeSuccess', function () {
        HttpUtils.setTrackingID();
      });

      if (Config.getEnv() === 'sparkprod' || Config.getEnv() === 'sparkint') {
        $translate.use('en_spark');
        $rootScope.favicon = 'images/sparkSm.png';
      } else {
        $rootScope.favicon = 'images/logo.png';
      }

    }
  ]);
