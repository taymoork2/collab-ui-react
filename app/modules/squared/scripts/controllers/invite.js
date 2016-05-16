(function () {
  'use strict';

  angular
    .module('Squared')
    .controller('InviteCtrl', InviteCtrl);

  function InviteCtrl($location, Utils, Log, UrlConfig, WindowLocation) {
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
