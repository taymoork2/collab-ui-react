(function () {
  'use strict';

  angular
    .module('Squared')
    .controller('ActivateCtrl', ActivateCtrl);

  /* @ngInject */
  function ActivateCtrl($scope, $location, Log, Utils, Activateservice, UrlConfig, WindowLocation) {
    //initialize ng-show variables
    $scope.result = {
      provisionSuccess: false,
      codeExpired: false,
      resendSuccess: false
    };

    var showHide = function (provision, expired, resend) {
      $scope.result.provisionSuccess = provision;
      $scope.result.codeExpired = expired;
      $scope.result.resendSuccess = resend;
    };

    var activateWeb = function () {
      showHide(true, false, false);
    };

    var activateErrorWeb = function () {
      showHide(false, true, false);
    };

    var activateMobile = function () {
      // launch app with URL: squared://confirmation_code_verified
      WindowLocation.set(UrlConfig.getSquaredAppUrl() + 'confirmation_code_verified');
    };

    var activateErrorMobile = function (errorCode) {
      // launch app with error URL: squared://confirmation_error_code/xxxx
      WindowLocation.set(UrlConfig.getSquaredAppUrl() + 'confirmation_error_code/' + errorCode);
    };

    var encryptedParam = $location.search().eqp;

    if (encryptedParam) {

      Activateservice.activateUser(encryptedParam)
        .then(function (res) {
          var data = res.data;

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
        }, function (status) {
          if (!Utils.isWeb()) {
            activateErrorMobile(status);
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

      Activateservice.resendCode(encryptedParam)
        .then(function (res) {
          if (res.data) {
            $scope.eqp = res.data.eqp;
            showHide(false, false, true);
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
