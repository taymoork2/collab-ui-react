(function() {
  'use strict';

  angular
    .module('Squared')
    .controller('AppdownloadCtrl', AppdownloadCtrl);

  /* @ngInject */
  function AppdownloadCtrl(UrlConfig, Utils, WindowLocation) {
    if (Utils.isIPhone()) {
      WindowLocation.set(UrlConfig.getItunesStoreUrl());
    } else if (Utils.isAndroid()) {
      WindowLocation.set(UrlConfig.getAndroidStoreUrl());
    } else {
      WindowLocation.set(UrlConfig.getWebClientUrl());
    }
  }
})();