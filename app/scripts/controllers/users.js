'use strict';

angular.module('wx2AdminWebClientApp')
	.controller('UsersCtrl', ['$scope', '$location', '$http', 'Storage', 'Config',
		function($scope, $location, $http, Storage, Config) {

			$scope.token = null;
			$scope.status = null;
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
						.success(function(data) {
							$scope.results = {
								'resultList': []
							};

							for (var i = 0; i < data.userResponse.length; i++) {

								var userResult = {
									'email': data.userResponse[i].email
								};

								var userStatus = data.userResponse[i].status;

								if (userStatus === 200) {
									userResult.message = 'added successfully';
								} else if (userStatus === 409) {
									userResult.message = 'already exists';
								} else {
									userResult.message = 'not added, status: ' + userStatus;
								}

								$scope.results.resultList.push(userResult);

							}

						})
						.error(function(data, status) {
							$scope.status = 'Request failed.  Status: ' + status + '\n' + data;
						});

				}

			};

			$scope.gotoEntitlement = function() {
				$location.path('/entitlement');
			};

		}
	]);