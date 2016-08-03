(function () {
  'use strict';

  module.exports = angular
    .module('squared.activate', [
      require('modules/core/config/urlConfig'),
      require('modules/core/windowLocation/windowLocation'),
      require('modules/core/scripts/services/log'),
      require('modules/core/scripts/services/utils'),
      require('modules/squared/scripts/services/activateService'),
    ])
    .controller('ActivateCtrl', ActivateCtrl)
    .name;

  /* @ngInject */
  function ActivateCtrl($scope, $location, Log, Utils, ActivateService, UrlConfig, WindowLocation) {
    //initialize ng-show variables
    $scope.result = {
      provisionSuccess: false,
      codeExpired: false,
      resendSuccess: false,
      errmsg: false
    };

    var hideAllMessages = function () {
      $scope.result.provisionSuccess = false;
      $scope.result.codeExpired = false;
      $scope.result.resendSuccess = false;
      $scope.result.errmsg = false;
    };

    var showProvisionSuccessMessage = function () {
      hideAllMessages();
      $scope.result.provisionSuccess = true;
    };

    var showCodeExpiredMessage = function () {
      hideAllMessages();
      $scope.result.codeExpired = true;
    };

    var showResendSuccessMessage = function () {
      hideAllMessages();
      $scope.result.resendSuccess = true;
    };

    var redirectToSparkWithSuccess = function () {
      // launch app with URL: squared://confirmation_code_verified
      WindowLocation.set(UrlConfig.getSquaredAppUrl() + 'confirmation_code_verified');
    };

    var redirectToSparkWithError = function (errorCode) {
      // launch app with error URL: squared://confirmation_error_code/xxxx
      WindowLocation.set(UrlConfig.getSquaredAppUrl() + 'confirmation_error_code/' + errorCode);
    };

    var encryptedParam = $location.search().eqp;

    if (encryptedParam) {

      ActivateService.activateUser(encryptedParam)
        .then(function (res) {
          var data = res.data;

          $scope.userEmail = data.email;
          $scope.deviceName = data.deviceName;
          $scope.pushId = data.pushId;
          $scope.deviceId = data.deviceId;
          $scope.deviceUserAgent = data.userAgent;

          if (!data.codeException) {
            showProvisionSuccessMessage();
            redirectToSparkWithSuccess();
          } else {
            showCodeExpiredMessage();
            redirectToSparkWithError(data.codeException);
          }
        })
        .catch(function (status) {
          if (!Utils.isWeb()) {
            redirectToSparkWithError(status);
          } else {
            $scope.result.errmsg = 'Failed to verify code and create user. Status: ' + status;
            Log.error($scope.result.errmsg);
          }
        });
    } else {
      $scope.result.errmsg = 'Null param on activation page';
      Log.error($scope.result.errmsg);
    }

    $scope.resendCode = function () {
      ActivateService.resendCode(encryptedParam)
        .then(function (res) {
          if (res.data) {
            showResendSuccessMessage();
            $scope.eqp = res.data.eqp;
          }
        }, function (status) {
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
})();
