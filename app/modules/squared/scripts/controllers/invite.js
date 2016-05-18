(function () {
  'use strict';

  angular
    .module('Squared')
    .controller('InviteCtrl', InviteCtrl);

  /* @ngInject */
  function InviteCtrl($location, Utils, Localytics, Log, UrlConfig, WindowLocation) {
    Localytics.tagEvent('Display /invite', {
      platform: Utils.isIPhone() ? 'iphone' : (Utils.isAndroid() ? 'android' : 'web')
    });
    var redirectUrl = null;

    if (Utils.isIPhone()) {
      redirectUrl = UrlConfig.getItunesStoreUrl();
    } else if (Utils.isAndroid()) {
      redirectUrl = UrlConfig.getAndroidStoreUrl();
    } else {
      redirectUrl = UrlConfig.getWebClientUrl();
    }
    Log.info('Redirect to: ' + redirectUrl);

    WindowLocation.set(redirectUrl);
  }
})();
