'use strict';

/**
 * @ngdoc function
 * @name wx2AdminWebClientApp.controller:AppdownloadCtrl
 * @description
 * # AppdownloadCtrl
 * Controller of the wx2AdminWebClientApp
 */
angular.module('Squared')
  .controller('AppdownloadCtrl', ['$window', '$http', 'Log', 'Config', 'Utils',
    function($window, $http, Log, Config, Utils) {

      if (Utils.isIPhone()) {
        $window.location.href = Config.getItunesStoreUrl();
      } else if (Utils.isAndroid()) {
        $window.location.href = Config.getAndroidStoreUrl();
      } else {
        $window.location.href = Config.getWebClientUrl();
      }
    }
  ]);