'use strict';

angular.module('wx2AdminWebClientApp')
	.service('Userservice', ['$http', '$rootScope', '$location', 'Storage', 'Config',
		function($http, $rootScope, $location, Storage, Config) {

			var userUrl = Config.adminUrl;
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
								'email': userEmail,
								'password': 'xyz',
								'name': userEmail,
							};
							userData.users.push(user);
						}
					}

					$http.defaults.headers.common.Authorization = 'Bearer ' + token;
					$http.put(userUrl + Config.defaultOrgId + '/user', userData)
						.success(function(data) {
							data.success = true;
							callback(data);
						})
						.error(function(data) {
							data.success = false;
							callback(data);
						});


				}

			};


		}
	]);