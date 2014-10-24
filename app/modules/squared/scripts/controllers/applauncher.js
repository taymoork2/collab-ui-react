'use strict';

/**
 * @ngdoc function
 * @name wx2AdminWebClientApp.controller:ApplauncherCtrl
 * @description
 * # ApplauncherCtrl
 * Controller of the wx2AdminWebClientApp
 */
angular.module('Squared')
  .controller('ApplauncherCtrl', ['$window', '$http', '$translate', 'Log', 'Config', 'Utils',
    function($window, $http, $translate, Log, Config, Utils) {

      if (Utils.isWeb()) {

        $window.location.href = Config.getWebClientUrl();

      } else if (Utils.isIPhone()) {

        $window.location.href = Config.getSquaredAppUrl();
        setTimeout(function() {
            $window.location.href = Config.getItunesStoreUrl();
          }, 25);

      } else if (Utils.isAndroid()) {
        $window.location.href = Config.getAndroidAppIntent();
      }


    }
  ]);