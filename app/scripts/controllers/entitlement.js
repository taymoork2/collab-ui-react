'use strict';

angular.module('wx2AdminWebClientApp')
	.controller('EntitlementCtrl', ['$scope', '$location', 'Userservice', 'Log',
		function($scope, $location, Userservice, Log) {
			$scope.entitle = function(userList) {
				Log.debug('Entitlements: ', userList);

				var callback = function(data, status) {
					$scope.status = null;
					$scope.results = null;
					if (data.success) {
						Log.info('User successfully entitled', data);
						$scope.results = {
							'resultList': []
						};

						for (var i = 0; i < data.userResponse.length; i++) {

							var userResult = {
								'email': data.userResponse[i].email
							};

							var userStatus = data.userResponse[i].status;

							if (userStatus === 200) {
								userResult.message = 'entitled successfully';
							} else if (userStatus === 404) {
								userResult.message = 'does not exists';
							} else {
								userResult.message = 'not entitled, status: ' + userStatus;
							}

							$scope.results.resultList.push(userResult);

						}
					
					} else {
						Log.warn('Could not entitle the user', data);
						$scope.status = 'Request failed.  Status: ' + status + '\n' + data;
					}
				};

				if (userList) {
					Userservice.entitleUsers(userList.split('\n'), callback);
				}

			};

		}
	]);