'use strict';

angular.module('wx2AdminWebClientApp')
	.controller('ActivateCtrl', ['$scope', '$location', '$http', '$window', 'Log', 'Activateservice',

		function($scope, $location, $http, $window, Log, Activateservice) {

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

			var activateWeb = function() {
				showHide(true, false, false);
			};

			var activateErrorWeb = function() {
				showHide(false, true, false);
			};

			var activateMobile = function() {
				// launch app with URL: squared://confirmation_code_verified
				$window.open('squared://confirmation_code_verified');
			};

			var activateErrorMobile = function(errorCode) {
				// launch app with error URL: squared://confirmation_error_code/xxxx
				$window.open('squared://confirmation_error_code/' + errorCode);
			};

			var encryptedParam = $location.search().eqp;

			if (encryptedParam) {

				Activateservice.activateUser(encryptedParam)
				.then(function(data) {
					$scope.userEmail = data.email;
					$scope.deviceName = data.deviceName;
					$scope.pushId = data.pushId;
					$scope.deviceId = data.deviceId;

					if (!$scope.isWeb) {
						if (!data.codeException) {
							activateMobile();
						} else {
							activateErrorMobile(data.codeException);
						}
					} else {
						if (!data.codeException) {
							activateWeb();
						} else {
							activateErrorWeb();
						}
					}
				}, function(status) {
					if (!$scope.isWeb) {
						activateErrorMobile(status);
					} else {
						if (status === 409) {
							$scope.result.errmsg = 'user ' + $scope.userEmail + ' alread exists';
						} else {
							$scope.result.errmsg = 'Failed to verify code and create user. Status: ' + status;
						}
						Log.error($scope.result.errmsg);
					}
				});
			} else {
				$scope.result.errmsg = 'Null param on actiation page';
				Log.error($scope.result.errmsg);
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

				Activateservice.resendCode($scope.userEmail, $scope.pushId, $scope.deviceName, $scope.deviceId)
				.then(function(data) {
					if (data) {
						showHide(false, false, true);
						$scope.eqp = data.eqp;
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
		}
	]);
