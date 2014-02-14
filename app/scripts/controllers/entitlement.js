'use strict';

angular.module('wx2AdminWebClientApp')
	.controller('EntitlementCtrl', ['$scope', '$location', 'Userservice', 'Log',
		function($scope, $location, Userservice, Log) {
			$scope.entitle = function(userList) {
				Log.debug('Users: ', userList);

				var callback = function(data) {
					if (data.success) {
						Log.info('User successfully entitled', data);
						$scope.status = 'Account(s) ' + userList + ' entitled successfully';
					} else {
						Log.warn('Could not entitle the user', data);
						$scope.status = 'Entitlement failed: ' + data;
					}
				};

				if (userList) {
					Userservice.entitleUsers(userList.split('\n'), callback);
				}

			};

		}
	]);