(function () {
  'use strict';

  angular
    .module('Squared')
    .controller('InviteCtrl', InviteCtrl);

  /* @ngInject */
  function InviteCtrl($timeout, Localytics, Log, UrlConfig, Utils, WindowLocation) {
    // Note: only keep $timeout and Localytics until we gathered enough data usage
    Localytics.tagEvent('Display /invite', {
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

    Log.info('Redirect to: ' + redirectUrl);

    $timeout(function () {
      WindowLocation.set(redirectUrl);
    }, 2000);
  }
})();
