'use strict';

angular.module('wx2AdminWebClientApp')
	.controller('DownloadsCtrl', ['$scope', '$location', '$http', 'Userservice',
		function($scope, $location, $http, Userservice) {

			$scope.email = $location.search().email;

			$http.get('download_urls.json')
			.success(function(data) {
				$scope.webClientURL = data.webClientURL;
				$scope.iPhoneURL = data.iPhoneURL;
				$scope.androidURL = data.androidURL;
			})
			.error(function(data, status) {
				console.log('Failed to read download_url.json.' + data + ' Status: ' + status);
			});

			$scope.isIPhone = function() {
				if (navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPod/i)) {
					return true;
				} else {
					return false;
				}
			};

			$scope.isAndroid = function() {
				if (navigator.userAgent.match(/Android/i) && navigator.userAgent.match(/mobile/i)) {
					return true;
				} else {
					return false;
				}
			};

			$scope.isWeb = function() {
				return !$scope.isIPhone() && !$scope.isAndroid();
			};

			$scope.hasJustResetPassword = $location.search().pwdResetSuccess;

			var callback = function(data, status) {
				if (data.success) {
					$scope.sendStatus = 'email success';
				} else {
					$scope.sendStatus = 'email failed status: ' + status;
				}
			};

			if ($scope.hasJustResetPassword) {
				// call backend to send email
				Userservice.sendEmail($scope.email, callback);
			}

		}
	]);