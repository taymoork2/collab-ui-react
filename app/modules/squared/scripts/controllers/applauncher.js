'use strict';

/**
 * @ngdoc function
 * @name wx2AdminWebClientApp.controller:ApplauncherCtrl
 * @description
 * # ApplauncherCtrl
 * Controller of the wx2AdminWebClientApp
 */
angular.module('Squared')
  .controller('ApplauncherCtrl', ['$window', '$http', '$translate', 'Log', 'UrlConfig', 'Utils', '$location',
    function ($window, $http, $translate, Log, UrlConfig, Utils, $location) {

      if (Utils.isWeb()) {

        var urlParams = '';
        var params = $location.absUrl().split('?')[1];
        if (params) {
          urlParams = '?' + params;
        }

        $window.location.href = UrlConfig.getWebClientUrl() + urlParams;

      } else if (Utils.isIPhone()) {

        $window.location.href = UrlConfig.getSquaredAppUrl();
        setTimeout(function () {
          $window.location.href = UrlConfig.getItunesStoreUrl();
        }, 25);

      } else if (Utils.isAndroid()) {
        $window.location.href = UrlConfig.getAndroidStoreUrl();
      }

    }
  ]);
