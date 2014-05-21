'use strict';

angular.module('wx2AdminWebClientApp')
	.controller('DownloadsCtrl', ['$scope', '$location', '$http', 'Userservice',
		function($scope, $location, $http, Userservice) {

			$scope.email = $location.search().email;
			$scope.tlData = {
		    email : $scope.email
		  };

			$http.get('download_urls.json')
			.success(function(data) {
				$scope.webClientURL = data.webClientURL;
				$scope.iPhoneURL = data.iPhoneURL;
				$scope.androidURL = data.AndroidURL;
			})
			.error(function(data, status) {
				console.log('Failed to read download_url.json.' + data + ' Status: ' + status);
			});

			var hasJustResetPassword = $location.search().pwdResetSuccess;

			if (hasJustResetPassword) {
				// call backend to send 

				var callback = function(data, status) {
					if (data.success) {
						$scope.sendStatus = 'email success';
					} else {
						$scope.sendStatus = 'email failed status: ' + status;
					}
				};

				Userservice.sendEmail($scope.email, $location.search().forward, callback);
			}

		}
	]);