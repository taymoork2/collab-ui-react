'use strict';

/**
 * @ngdoc function
 * @name wx2AdminWebClientApp.controller:InvitelauncherCtrl
 * @description
 * # InvitelauncherCtrl
 * Controller of the wx2AdminWebClientApp
 */
angular.module('Squared')
  .controller('InvitelauncherCtrl', ['$window', 'ipCookie', 'Log', 'Config',
    function ($window, ipCookie, Log, Config) {

      var redirect = function () {

        // check if cookie exists.
        var cookieName = 'invdata';
        var inviteCookie = ipCookie(cookieName);

        console.log('cookie:');
        console.log(inviteCookie);

        // launch app with URL: squared://invitee/?invdata=inviteCookie
        var redirectUrl = Config.getSquaredAppUrl() + 'invitee/?invdata=' + JSON.stringify(inviteCookie);
        $window.location.href = redirectUrl;
      };
      redirect();
    }

  ]);
