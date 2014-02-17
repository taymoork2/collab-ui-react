'use strict';

angular.module('wx2AdminWebClientApp')
	.controller('UsersCtrl', ['$scope', '$location', 'Userservice', 'Log',
		function($scope, $location, Userservice, Log) {

			$scope.addUsers = function(userList) {

				Log.debug('Entitlements: ', userList);

				var callback = function(data, status) {
					$scope.status = null;
					$scope.results = null;
					if (data.success) {
						Log.info('User add reqeust returned:', data);
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
						
					} else {
						Log.warn('Could not entitle the user', data);
						$scope.status = 'Request failed.  Status: ' + status + '\n' + data;
					}
				};

				if (userList) {
					var usersArray = userList.split(';');
					Userservice.addUsers(usersArray, callback);

				}
			};

			$scope.gotoEntitlement = function() {
				$location.path('/entitlement');
			};

		}
	]);