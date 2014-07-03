'use strict';

angular.module('wx2AdminWebClientApp')
	.controller('InviteCtrl', ['$scope', '$location', '$window', '$http', 'ipCookie', 'Utils', 'Inviteservice', 'Log', 
		function($scope, $location, $window, $http, ipCookie, Utils, Inviteservice, Log) {

			// check if cookie is present 
			var cookieName = 'invdata';
			var inviteCookie = ipCookie(cookieName);

			if (inviteCookie === undefined) {

				inviteCookie = {
					userEmail: null,
					displayName: null,
					entitlements: 'webExSquared'
				};
				var cookieOptions = {
					domain: '.wbx2.com',
					expires: 1  // 1 day
				};

				// extracts param from url
				var encryptedUser = $location.search().user;

				// call backend to decrypt param 
				Inviteservice.resolveMockedUser(encryptedUser)
					.then(function(data) {
						$scope.sendStatus = 'email success';

						if (data.email) {
							inviteCookie.userEmail = data.email;
						}

						if (data.displayName) {
							inviteCookie.displayName = data.displayName;
						}

						if (data.entitlements) {
							inviteCookie.entitlements = data.entitlements;
						}

						ipCookie(cookieName, inviteCookie, cookieOptions);
					});
			}

			// redirect based on user agent
			var redirectUrl = null;

			$http.get('download_urls.json')
				.success(function(data) {
					if (Utils.isIPhone()) {
						redirectUrl = data.iPhoneURL;
					} else if (Utils.isAndroid()) {
						redirectUrl = data.iPhoneURL;
					} else {
						redirectUrl = data.webClientURL;
					}
					Log.info('Redirect to: ' + redirectUrl);
					$window.location.href = redirectUrl;
				})
				.error(function(data, status) {
					Log.error('Failed to read download_url.json.' + data + ' Status: ' + status);
				});

		}
	]);