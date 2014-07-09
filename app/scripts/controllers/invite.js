'use strict';

angular.module('wx2AdminWebClientApp')
	.controller('InviteCtrl', ['$scope', '$location', '$window', '$http', 'ipCookie', 'Utils', 'Inviteservice', 'Config', 'Log',
		function($scope, $location, $window, $http, ipCookie, Utils, Inviteservice, Config, Log) {

			var redirect = function() {
				var redirectUrl = null;

				// redirect based on user agent
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
			};

			// check if cookie is present 
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

				// extracts param from url
				var encryptedUser = $location.search().user;

				// call backend to decrypt param 
				Inviteservice.resolveInvitedUser(encryptedUser)
					.then(function(data) {
						Log.debug('param decrypted');

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