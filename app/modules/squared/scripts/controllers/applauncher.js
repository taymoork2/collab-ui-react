(function () {
  'use strict';

  angular
    .module('Squared')
    .controller('ApplauncherCtrl', ApplauncherCtrl);

  /* @ngInject */
  function ApplauncherCtrl($location, $timeout, UrlConfig, Utils, WindowLocation, Localytics) {
    // Note: only keep $timeout and Localytics until we gathered enough data usage
    Localytics.tagEvent('Display /applauncher', {
      platform: Utils.isIPhone() ? 'iphone' : (Utils.isAndroid() ? 'android' : 'web')
    });

    $timeout(function () {
      if (Utils.isWeb()) {
        var urlParams = '';
        var params = $location.absUrl().split('?')[1];
        if (params) {
          urlParams = '?' + params;
        }
        WindowLocation.set(UrlConfig.getWebClientUrl() + urlParams);
      } else if (Utils.isIPhone()) {
        WindowLocation.set(UrlConfig.getSquaredAppUrl());
        $timeout(function () {
          WindowLocation.set(UrlConfig.getItunesStoreUrl());
        }, 25);
      } else if (Utils.isAndroid()) {
        WindowLocation.set(UrlConfig.getAndroidStoreUrl());
      }
    }, 2000);
  }
})();
