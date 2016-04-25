(function() {
  'use strict';

  angular
    .module('Squared')
    .controller('ApplauncherCtrl', ApplauncherCtrl);

  /* @ngInject */
  function ApplauncherCtrl(UrlConfig, Utils, $location, WindowLocation) {
    if (Utils.isWeb()) {
      var urlParams = '';
      var params = $location.absUrl().split('?')[1];
      if (params) {
        urlParams = '?' + params;
      }
      WindowLocation.set(UrlConfig.getWebClientUrl() + urlParams);
    } else if (Utils.isIPhone()) {
      WindowLocation.set(UrlConfig.getSquaredAppUrl());
      setTimeout(function () {
        WindowLocation.set(UrlConfig.getItunesStoreUrl());
      }, 25);
    } else if (Utils.isAndroid()) {
      WindowLocation.set(UrlConfig.getAndroidStoreUrl());
    }
  }
})();