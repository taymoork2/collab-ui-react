(function () {
  'use strict';

  angular
    .module('Squared')
    .controller('ApplauncherCtrl', ApplauncherCtrl);

  /* @ngInject */
  function ApplauncherCtrl($location, $timeout, UrlConfig, Utils, WindowLocation, Localytics) {
    var platform = Utils.isIPhone() ? 'iphone' : (Utils.isAndroid() ? 'android' : 'web');
    Localytics.tagEvent('Display /applauncher', {
      platform: platform
    });
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
  }
})();
