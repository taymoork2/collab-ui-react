'use strict';

angular.module('wx2AdminWebClientApp')
	.controller('UsersCtrl', ['$scope', '$location', '$http', 'Storage', 'Config',
		function($scope, $location, $http, Storage, Config) {

			$scope.token = null;
			var token = Storage.get('accessToken');
			var userUrl = Config.adminUrl;
			var orgId = Config.defaultOrgId;

			$scope.addUsers = function(userList) {
				if (userList) {
					var usersArray = userList.split(';');

					var userData = {
						'users': []
					};

					for (var i = 0; i < usersArray.length; i++) {
						var userEmail = usersArray[i].trim();

						if (userEmail.length > 0) {
							var user = {
								'email': userEmail,
								'password': 'xyz',
								'name': userEmail
							};
							userData.users.push(user);
						}
					}

					$http.defaults.headers.common.Authorization = 'Bearer ' + token;
					$http.put(userUrl + orgId + '/user', userData)
						.success(function() {
							$scope.status = 'Account(s) ' + userList + ' added successfully';
						})
						.error(function(data, status) {
							$scope.status = data || 'Request failed.  Status: ' + status;
						});

				}

			};

			$scope.gotoEntitlement = function() {
				$location.path('/entitlement');
			};

		}
	]);