'use strict';
angular
  .module('wx2AdminWebClientApp')
  .run(['$cookies', '$location', '$rootScope', 'Auth', 'Authinfo', 'Storage', 'Localize', 'Utils', 'Log', '$interval', '$document', 'Config', '$state', 'SessionStorage',
    function ($cookies, $location, $rootScope, Auth, Authinfo, Storage, Localize, Utils, Log, $interval, $document, Config, $state, SessionStorage) {

      //Expose the localize service globally.
      $rootScope.Localize = Localize;
      $rootScope.Utils = Utils;
      $rootScope.services = [];
      $rootScope.exporting = false;

      //Enable logging
      $rootScope.debug = true;

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

      var data = null;
      $rootScope.status = 'init';

      if (!Storage.get('accessToken')) {
        if (document.URL.indexOf('access_token') !== -1) {
          data = Auth.getFromGetParams(document.URL);
          $rootScope.status = 'loaded';
          Storage.put('accessToken', data.access_token);
          $rootScope.token = data.access_token;

        } else if (document.URL.indexOf('code') !== -1) {
          data = Auth.getFromStandardGetParams(document.URL);
          $rootScope.status = 'loading';
          Auth.getNewAccessToken(data.code)
            .then(function (adata) {
              $rootScope.status = 'loaded';
              Storage.put('accessToken', adata.access_token);
              Storage.put('refreshToken', adata.refresh_token);
              $rootScope.token = data.access_token;
              $rootScope.$broadcast('ACCESS_TOKEN_REVIEVED');
            }, function () {
              Auth.redirectToLogin();
            });
        } else {
          Log.debug('No access code data.');
        }
      }

      var refreshToken = function () {
        var refreshTimer = $interval(function () {
          Auth.RefreshAccessToken(Storage.get('refreshToken'))
            .then(function (adata) {
              Storage.put('accessToken', adata.access_token);
              $rootScope.token = data.access_token;
            });
        }, Config.tokenTimers.refreshTimer); //30 minutes
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

    }
  ]);
