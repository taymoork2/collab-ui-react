'use strict';

angular
  .module('Squared')
  .controller('InvitelauncherCtrl', InvitelauncherCtrl);

/* @ngInject */
function InvitelauncherCtrl(ipCookie, UrlConfig, WindowLocation) {
  var redirect = function () {
    // check if cookie exists.
    var cookieName = 'invdata';
    var inviteCookie = ipCookie(cookieName);
    // launch app with URL: squared://invitee/?invdata=inviteCookie
    var redirectUrl = UrlConfig.getSquaredAppUrl() + 'invitee/?invdata=' + JSON.stringify(inviteCookie);
    WindowLocation.set(redirectUrl);
  };
  redirect();
}
