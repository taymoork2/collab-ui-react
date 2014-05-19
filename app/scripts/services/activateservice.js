'use strict';

angular.module('wx2AdminWebClientApp')
	.service('Activateservice', ['$http', '$q', 'Storage', 'Config', 'Auth', 'Log',
		// AngularJS will instantiate a singleton by calling "new" on this function
		function Activateservice($http, $q, Storage, Config, Auth, Log) {

			var userUrl = Config.getAdminServiceUrl();

			return {
			
				activateUser: function(encryptedParam) {
					var deferred = $q.defer();
					var requestBody = {
						'encryptedQueryString': encryptedParam
					};

					Auth.getAccessToken()
					.then(function(token) {

						$http.defaults.headers.common.Authorization = 'Bearer ' + token;
						$http.post(userUrl + 'users/email/activate', requestBody)
							.success(function(data) {
								deferred.resolve(data);
							})
							.error(function(data, status) {
								Log.error('Failed user activation.  Status: ' + status);
								deferred.reject(status);
							});
					}, function(reason) {
						deferred.reject(reason);
					});

					return deferred.promise;
				},

				resendCode: function(email, pushId, deviceName, deviceId) {
					var deferred = $q.defer();
					var requestBody = {
						'email': email,
						'pushId': pushId,
						'deviceName': deviceName,
						'deviceId': deviceId
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
