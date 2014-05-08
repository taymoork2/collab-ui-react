'use strict';

angular.module('wx2AdminWebClientApp')
.controller('UserProfileCtrl', ['$scope', '$location', '$route', '$routeParams', 'Log', 'Utils', '$translate', 'Userservice',
	function($scope, $location, $route, $routeParams, Log, Utils, $translate, Userservice) {

		$scope.user;
		var userid = $route.current.params.uid;

		Userservice.getUser(userid, function(data, status) {
			if (data.success) {
				$scope.user = data;
			} else {
				Log.debug('Get existing user failed. Status: ' + status);
			}
		});

	}
]);