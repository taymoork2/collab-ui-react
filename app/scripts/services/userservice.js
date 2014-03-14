'use strict';

angular.module('wx2AdminWebClientApp')
	.service('Userservice', ['$http', '$rootScope', '$location', 'Storage', 'Config',
		function($http, $rootScope, $location, Storage, Config) {

			var userUrl = Config.adminServiceUrl;
			var token = Storage.get('accessToken');

			return {
				entitleUsers: function(userEmailArray, callback) {
					var userData = {
						'users': []
					};

					for (var i = 0; i < userEmailArray.length; i++) {
						var userEmail = userEmailArray[i].trim();

						if (userEmail.length > 0) {
							var user = {
								'email': userEmail
							};
							userData.users.push(user);
						}
					}

					$http.defaults.headers.common.Authorization = 'Bearer ' + token;
					$http.post(userUrl + 'user', userData)
						.success(function(data, status) {
							data.success = true;
							callback(data, status);
						})
						.error(function(data, status) {
							data.success = false;
							data.status = status;
							callback(data, status);
						});
				},

				addUsers: function(userEmailArray, callback) {
					var userData = {
						'users': []
					};

					for (var i = 0; i < userEmailArray.length; i++) {
						var userEmail = userEmailArray[i].trim();

						if (userEmail.length > 0) {
							var user = {
								'email': userEmail
							};
							userData.users.push(user);
						}
					}

					$http.defaults.headers.common.Authorization = 'Bearer ' + token;
					$http.put(userUrl + 'user', userData)
						.success(function(data, status) {
							data.success = true;
							callback(data, status);
						})
						.error(function(data, status) {
							data.success = false;
							data.status = status;
							callback(data, status);
						});

				},

				sendEmail: function(userEmail, callback) {

					$http.post(userUrl + 'user/mail?email=' + userEmail)
						.success(function(data, status) {
							data.success = true;
							callback(data, status);
						})
						.error(function(data, status) {
							data.success = false;
							data.status = status;
							callback(data, status);
						});
				}

			};


		}
	]);