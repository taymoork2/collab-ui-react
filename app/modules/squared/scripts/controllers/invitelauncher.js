(function () {
  'use strict';

  angular
    .module('Squared')
    .controller('InvitelauncherCtrl', InvitelauncherCtrl);

  /* @ngInject */
  function InvitelauncherCtrl($cookies, UrlConfig, WindowLocation, Localytics) {
    Localytics.tagEvent('Display /invitelauncher', {
      inviteCookie: !!$cookies.getObject(cookieName)
    });
    // check if cookie exists.
    var cookieName = 'invdata';
    var inviteCookie = $cookies.getObject(cookieName);
    // launch app with URL: squared://invitee/?invdata=inviteCookie
    var redirectUrl = UrlConfig.getSquaredAppUrl() + 'invitee/?invdata=' + JSON.stringify(inviteCookie);
    WindowLocation.set(redirectUrl);
  }
})();
