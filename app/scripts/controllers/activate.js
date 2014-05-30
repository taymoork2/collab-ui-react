'use strict';

angular.module('wx2AdminWebClientApp')
	.controller('ActivateCtrl', ['$scope', '$location', '$http', '$window', 'Log', 'Utils', 'Activateservice',

		function($scope, $location, $http, $window, Log, Utils, Activateservice) {

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
				$scope.iosDownload = deviceIsAndroid();
				$scope.androidDownload = deviceIsIPhone();
				showHide(true, false, false);
			};

			var activateErrorWeb = function() {
				showHide(false, true, false);
			};

			var activateMobile = function() {
				// launch app with URL: squared://confirmation_code_verified
				$window.location.href = 'squared://confirmation_code_verified';
			};

			var activateErrorMobile = function(errorCode) {
				// launch app with error URL: squared://confirmation_error_code/xxxx
				$window.location.href = 'squared://confirmation_error_code/' + errorCode;
			};

			var encryptedParam = $location.search().eqp;

			if (encryptedParam) {

				Activateservice.activateUser(encryptedParam)
				.then(function(data) {
					$scope.userEmail = data.email;
					$scope.deviceName = data.deviceName;
					$scope.pushId = data.pushId;
					$scope.deviceId = data.deviceId;
					$scope.deviceUserAgent = data.userAgent;

					if (!Utils.isWeb()) {
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
					if (!Utils.isWeb()) {
						activateErrorMobile(status);
					} else {
						$scope.result.errmsg = 'Failed to verify code and create user. Status: ' + status;
						Log.error($scope.result.errmsg);
					}
				});
			} else {
				$scope.result.errmsg = 'Null param on actiation page';
				Log.error($scope.result.errmsg);
			}

			var deviceIsIPhone = function() {
				var platform = $scope.deviceUserAgent;
				return platform.search(/iOS/i) > -1 || platform.search(/iPhone/i) > -1 || platform.search(/iPod/i) >-1 || platform.search(/iPad/i) >-1;
			};

			var deviceIsAndroid = function() {
				var platform = $scope.deviceUserAgent;
				return platform.search(/Android/i) >-1;
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

				Activateservice.resendCode(encryptedParam)
				.then(function(data) {
					if (data) {
						$scope.eqp = data.eqp;
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
		}
	]);
