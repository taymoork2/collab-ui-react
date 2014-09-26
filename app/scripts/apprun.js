'use strict';
angular
  .module('wx2AdminWebClientApp')
  .run(['$cookies', '$location', '$rootScope', 'Auth', 'Storage', 'Localize', 'Utils', 'Log', '$interval', '$document', 'Config',
    function($cookies, $location, $rootScope, Auth, Storage, Localize, Utils, Log, $interval, $document, Config) {

      //Expose the localize service globally.
      $rootScope.Localize = Localize;
      $rootScope.Utils = Utils;
      $rootScope.services = [];
      $rootScope.exporting = false;

      //Enable logging
      $rootScope.debug = true;

      var data = null;
      $rootScope.status = 'init';

      if (!Storage.get('accessToken')) {
        if (document.URL.indexOf('access_token') !== -1) {
          data = Auth.getFromGetParams(document.URL);
          $rootScope.status = 'loaded';
          Storage.put('accessToken', data.access_token);

        } else if (document.URL.indexOf('code') !== -1) {
          data = Auth.getFromStandardGetParams(document.URL);
          $rootScope.status = 'loading';
          Auth.getNewAccessToken(data.code)
          .then(function (adata){
            $rootScope.status = 'loaded';
            Storage.put('accessToken', adata.access_token);
            Storage.put('refreshToken', adata.refresh_token);
            $rootScope.$broadcast('ACCESS_TOKEN_REVIEVED');
          }, function() {
            Auth.redirectToLogin();
          });
        } else {
          Log.debug('No access code data.');
        }
      }

      var timerClock = Config.tokenTimers.timeoutTimer;  //20 minutes
      var startTimer = function() {
        Log.debug('starting session timer...');
        var timer = $interval(function() {
            $interval.cancel(timer);
            //force logout when 20 minutes of inactivity
            Auth.logout();
          },
          timerClock
        );

        return timer;
      };

      var refreshToken = function() {
        var refreshTimer = $interval(function() {
          Auth.RefreshAccessToken(Storage.get('refreshToken'))
          .then(function (adata){
            Storage.put('accessToken', adata.access_token);
          });
        }, Config.tokenTimers.refreshTimer); //30 minutes
      };

      var logoutTimer = startTimer();

      var delay = $interval(function() {
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

      $document.on(
        'click',
        function( event ) {
          Log.debug('recieved click event, extending session...');
          $interval.cancel( logoutTimer );
          logoutTimer = startTimer();
        }
      );

    }
  ]);
