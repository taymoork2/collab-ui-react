'use strict';

angular.module('wx2AdminWebClientApp')
	.service('Activateservice', ['$http', '$q', 'Storage', 'Config', 'Auth', 'Log',
		// AngularJS will instantiate a singleton by calling "new" on this function
		function Activateservice($http, $q, Storage, Config, Auth, Log) {

			var userUrl = Config.getAdminServiceUrl();

			return {

				// TODO: change to encoded param api
				verifyCode: function(email, deviceId, code) {
					var deferred = $q.defer();
					var requestBody = {
						'email': email,
						'confirmationCode': code,
						'pushId': 'randomdeviceid'
					};

					Auth.getAccessToken()
					.then(function(token) {

						$http.defaults.headers.common.Authorization = 'Bearer ' + token;
						$http.post(userUrl + 'users/provision', requestBody)
							.success(function(data) {
								deferred.resolve(data);
							})
							.error(function(data, status) {
								Log.error('Failed user provisioning.  Status: ' + status);
								deferred.reject(status);
							});
					}, function(reason) {
						deferred.reject(reason);
					});

					return deferred.promise;
				},

				resendCode: function(email, pushId, deviceName) {
					var deferred = $q.defer();
					var requestBody = {
						'email': email,
						'pushId': pushId,
						'deviceName': deviceName
					};

					Auth.getAccessToken()
					.then(function(token) {
						$http.defaults.headers.common.Authorization = 'Bearer ' + token;
						$http.post(userUrl + 'users/email/verify', requestBody)
							.success(function(data) {
								deferred.resolve(data);
							})
							.error(function(data, status) {
								Log.error('Failed email verify.  Status: ' + status);
								deferred.reject(status);
							});
					}, function(reason) {
						deferred.reject(reason);
					});

					return deferred.promise;
				},

				getWebUserForwardUrl: function(param, callback) {
					var requestBody = {
						'encodedParam': param
					};
					Auth.getAccessToken().then(function(token) {
						$http.defaults.headers.common.Authorization = 'Bearer ' + token;
						$http.post(userUrl + 'users/pwdurl', requestBody)
							.success(function(data, status) {
								data.success = true;
								callback(data, status);
							})
							.error(function(data, status) {
								data.success = false;
								callback(data, status);
							});
					});
				}
			};
		}
	]);