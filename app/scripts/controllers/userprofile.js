'use strict';

angular.module('wx2AdminWebClientApp')
.controller('UserProfileCtrl', ['$scope', '$location', '$route', '$routeParams', 'Log', 'Utils', '$translate', 'Userservice',
	function($scope, $location, $route, $routeParams, Log, Utils, $translate, Userservice) {
		var userid = $route.current.params.uid;

		Userservice.getUser(userid, function(data, status) {
			if (data.success) {
				$scope.user = data;
			} else {
				Log.debug('Get existing user failed. Status: ' + status);
			}
		});

    //Static data. To be replaced later with data from list logs API.
    $scope.userlogs = [{
      name: 'testuser_log_41234',
      date: new Date(),
    },
    {
      name: 'testuser_log_12341',
      date: new Date(),
    },
    {
      name: 'testuser_log_52123',
      date: new Date(),
    }];


	}
]);
