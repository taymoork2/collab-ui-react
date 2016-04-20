'use strict';

angular.module('Squared')
  .controller('InviteCtrl', ['$scope', '$location', '$window', '$http', 'ipCookie', 'Utils', 'Inviteservice', 'Config', 'Log', 'UrlConfig',
    function ($scope, $location, $window, $http, ipCookie, Utils, Inviteservice, Config, Log, UrlConfig) {

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
        $window.location.href = redirectUrl;
      };

      // extracts param from url
      var encryptedUser = $location.search().user;

      if (encryptedUser === undefined) {
        redirect();
      }

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

        // call backend to decrypt param
        Inviteservice.resolveInvitedUser(encryptedUser)
          .then(function (res) {
            Log.debug('param decrypted');
            var data = res.data;

            inviteCookie.userEmail = data.email;
            inviteCookie.displayName = data.displayName;
            inviteCookie.entitlements = data.entitlements;
            inviteCookie.orgId = data.orgId;

            ipCookie(cookieName, inviteCookie, cookieOptions);

            redirect();
          });

      } else {
        redirect();
      }

    }
  ]);
