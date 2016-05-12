(function () {
  'use strict';

  angular
    .module('Squared')
    .controller('AppdownloadCtrl', AppdownloadCtrl);

  /* @ngInject */
  function AppdownloadCtrl($document, UrlConfig, Utils, WindowLocation, Localytics) {
    var platform = Utils.isIPhone() ? 'iphone' : (Utils.isAndroid() ? 'android' : 'web');
    Localytics.tagEvent('Display /appdownload', {
      from: $document[0].referrer,
      platform: platform
    });
    if (Utils.isIPhone()) {
      WindowLocation.set(UrlConfig.getItunesStoreUrl());
    } else if (Utils.isAndroid()) {
      WindowLocation.set(UrlConfig.getAndroidStoreUrl());
    } else {
      WindowLocation.set(UrlConfig.getWebClientUrl());
    }
  }
})();
