'use strict';

/**
 * @ngdoc function
 * @name wx2AdminWebClientApp.controller:ApplauncherCtrl
 * @description
 * # ApplauncherCtrl
 * Controller of the wx2AdminWebClientApp
 */
angular.module('Squared')
  .controller('ApplauncherCtrl', ['$window', '$http', '$translate', 'Log', 'Config', 'Utils', '$location',
    function ($window, $http, $translate, Log, Config, Utils, $location) {

      if (Utils.isWeb()) {

        var urlParams = '';
        var params = $location.absUrl().split('?')[1];
        if (params) {
          urlParams = '?' + params;
        }

        if (Config.getEnv() === 'sparkprod' || Config.getEnv() === 'sparkint') {
          $window.location.href = Config.getSparkWebClientUrl() + urlParams;
        } else {
          $window.location.href = Config.getWebClientUrl() + urlParams;
        }

      } else if (Utils.isIPhone()) {

        $window.location.href = Config.getSquaredAppUrl();
        setTimeout(function () {
          $window.location.href = Config.getItunesStoreUrl();
        }, 25);

      } else if (Utils.isAndroid()) {
        $window.location.href = Config.getAndroidStoreUrl();
      }

    }
  ]);
