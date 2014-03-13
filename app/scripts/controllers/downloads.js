'use strict';

angular.module('wx2AdminWebClientApp')
	.controller('DownloadsCtrl', ['$scope', '$location', '$http',
		function($scope, $location, $http) {

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
				return !$scope.isIOS() && !$scope.isAndroid();
			};

			$scope.hasJustResetPassword = $location.search().pwdResetSuccess;
			if ($scope.hasJustResetPassword) {
				// call backend to send email
			}

		}
	]);