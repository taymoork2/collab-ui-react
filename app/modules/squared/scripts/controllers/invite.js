(function () {
  'use strict';

  angular
    .module('Squared')
    .controller('InviteCtrl', InviteCtrl);

  function InviteCtrl($location, ipCookie, Utils, Inviteservice, Config, Log, UrlConfig, WindowLocation) {
    var redirect = function () {
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
    };

    redirect();

    // check if cookie already exists.  Only call backend if not.
    var cookieName = 'invdata';
    var inviteCookie = ipCookie(cookieName);

    if (inviteCookie === undefined) {

      inviteCookie = {
        userEmail: null,
        displayName: null,
        orgId: null,
        entitlements: null
      };
      var cookieOptions = {
        domain: Config.isDev() ? null : '.wbx2.com',
        expires: 1 // 1 day
      };

    } else {
      redirect();
    }
  }
})();
