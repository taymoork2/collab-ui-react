(function () {
  'use strict';

  angular
    .module('Squared')
    .controller('AppdownloadCtrl', AppdownloadCtrl);

  /* @ngInject */
  function AppdownloadCtrl($document, $timeout, UrlConfig, Utils, WindowLocation, Localytics) {
    // Note: only keep $timeout and Localytics until we gathered enough data usage
    Localytics.tagEvent('Display /appdownload', {
      from: $document[0].referrer,
      platform: Utils.isIPhone() ? 'iphone' : (Utils.isAndroid() ? 'android' : 'web')
    });

    var redirectUrl;

    if (Utils.isIPhone()) {
      redirectUrl = UrlConfig.getItunesStoreUrl();
    } else if (Utils.isAndroid()) {
      redirectUrl = UrlConfig.getAndroidStoreUrl();
    } else {
      redirectUrl = UrlConfig.getWebClientUrl();
    }

    $timeout(function () {
      WindowLocation.set(redirectUrl);
    }, 2000);
  }
})();
