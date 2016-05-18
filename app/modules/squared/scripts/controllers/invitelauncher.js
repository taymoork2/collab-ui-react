(function () {
  'use strict';

  angular
    .module('Squared')
    .controller('InvitelauncherCtrl', InvitelauncherCtrl);

  /* @ngInject */
  function InvitelauncherCtrl($cookies, $timeout, UrlConfig, WindowLocation, Localytics) {
    // Note: only keep $timeout and Localytics until we gathered enough data usage
    Localytics.tagEvent('Display /invitelauncher', {
      inviteCookie: !!$cookies.getObject(cookieName)
    });
    // check if cookie exists.
    var cookieName = 'invdata';
    var inviteCookie = $cookies.getObject(cookieName) || '';
    // launch app with URL: squared://invitee/?invdata=inviteCookie
    var redirectUrl = UrlConfig.getSquaredAppUrl() + 'invitee/?invdata=' + JSON.stringify(inviteCookie);
    $timeout(function () {
      WindowLocation.set(redirectUrl);
    }, 2000);
  }
})();
