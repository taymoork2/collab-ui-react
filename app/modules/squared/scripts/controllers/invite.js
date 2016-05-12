(function () {
  'use strict';

  angular
    .module('Squared')
    .controller('InviteCtrl', InviteCtrl);

  function InviteCtrl($location, $cookies, Utils, Inviteservice, Config, Log, UrlConfig, WindowLocation) {
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

    // extracts param from url
    var encryptedUser = $location.search().user;

    if (encryptedUser === undefined) {
      redirect();
      return;
    }

    // check if cookie already exists.  Only call backend if not.
    var cookieName = 'invdata';
    var inviteCookie = $cookies.getObject(cookieName);

    if (inviteCookie !== undefined) {
      redirect();
      return;
    }

    inviteCookie = {
      userEmail: null,
      displayName: null,
      orgId: null,
      entitlements: null
    };
    var expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + 1); // 1 day
    var cookieOptions = {
      domain: Config.isDev() ? null : '.wbx2.com',
      expires: expireDate
    };

    // call backend to decrypt param
    Inviteservice.resolveInvitedUser(encryptedUser)
      .then(function (res) {
        Log.debug('param decrypted');
        var data = res.data;

        inviteCookie.userEmail = data.email;
        inviteCookie.displayName = data.displayName;
        inviteCookie.entitlements = data.entitlements;
        inviteCookie.orgId = data.orgId;

        $cookies.putObject(cookieName, inviteCookie, cookieOptions);

        redirect();
      });
  }
})();
