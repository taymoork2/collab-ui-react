'use strict';

angular.module('wx2AdminWebClientApp')
	.controller('ActivateCtrl', ['$scope', '$location', '$http', 'Log', 'Activateservice',

		function($scope, $location, $http, Log, Activateservice) {

			//initialize ng-show variables
			$scope.result = {
				provisionSuccess: false,
				codeExpired: false,
				resendSuccess: false
			};

			var showHide = function(provision, expired, resend) {
				$scope.result.provisionSuccess = provision;
				$scope.result.codeExpired = expired;
				$scope.result.resendSuccess = resend;
			};

			//
			//var params = $location.search().params;

			$scope.userEmail = $location.search().email;
			$scope.deviceName = $location.search().deviceName;
			var pushId = $location.search().pushId;
			var confirmationCode = $location.search().confirmationCode;

			if (confirmationCode) {

				// to be changed to the encoded api
				Activateservice.verifyCode($scope.userEmail, pushId, confirmationCode)
				.then(function(data) {
					// TODO: parse decoded fields from response
					// $scope.userEmail = data.email;
					// $scope.deviceName = data.deviceName;

					showHide(true, false, false);

					// TODO: handle other invalid/expired code condition
					// showHide(false, true, false);

					// TODO: launch app if not web

				}, function(status) {
					if (status === 409) {
						Log.error('user ' + $scope.userEmail + ' alread exists');
						$scope.result.errmsg = 'user ' + $scope.userEmail + ' alread exists';
					} else {
						Log.error('Failed to verify code and create user. Status: ' + status);
						$scope.result.errmsg = 'status: ' + status;
					}
				});
			} else {
				showHide(false, true, false);
			}

			$scope.isIPhone = function() {
				return navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPod/i);
			};

			$scope.isAndroid = function() {
				return navigator.userAgent.match(/Android/i) && navigator.userAgent.match(/mobile/i);
			};

			$scope.isWeb = function() {
				return !$scope.isIPhone() && !$scope.isAndroid();
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

			$scope.resendCode = function() {

				Activateservice.resendCode($scope.userEmail, pushId, $scope.deviceName)
				.then(function(data) {
					if (data) {
						showHide(false, false, true);
					}
				}, function(status) {
					if (status === 404) {
						Log.error('user ' + $scope.userEmail + ' does not exist');
						$scope.result.errmsg = 'user ' + $scope.userEmail + ' does not exist';
					} else {
						Log.error('Failed to regenerate confirmation code. Status: ' + status);
						$scope.result.errmsg = 'status: ' + status;
					}
				});

			};

			$scope.testAction = function() {
				showHide(false, true, false);
			};
		}
	]);
