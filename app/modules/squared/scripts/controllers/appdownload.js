'use strict';

/**
 * @ngdoc function
 * @name wx2AdminWebClientApp.controller:AppdownloadCtrl
 * @description
 * # AppdownloadCtrl
 * Controller of the wx2AdminWebClientApp
 */
angular.module('Squared')
  .controller('AppdownloadCtrl', ['$window', '$http', 'Log', 'UrlConfig', 'Utils',
    function ($window, $http, Log, UrlConfig, Utils) {

      if (Utils.isIPhone()) {
        $window.location.href = UrlConfig.getItunesStoreUrl();
      } else if (Utils.isAndroid()) {
        $window.location.href = UrlConfig.getAndroidStoreUrl();
      } else {
        $window.location.href = UrlConfig.getWebClientUrl();
      }
    }
  ]);
