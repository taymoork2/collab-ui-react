(function () {
  'use strict';

  angular.module('Squared')
    .controller('CsAdminCtrl', CsAdminCtrl);

  /* @ngInject */
  function CsAdminCtrl($scope, $location, Log, csadminservice) {

    //initialize ng-show variables
    $scope.result = {
      success: false,
      linkExpired: false,
      error: false
    };

    var showHide = function (success, expired, error) {
      $scope.result.success = success;
      $scope.result.linkExpired = expired;
      $scope.result.error = error;
    };

    var csAdminSuccess = function () {
      showHide(true, false, false);
    };

    var csAdminLinkExpire = function () {
      showHide(false, true, false);
    };

    var csAdminError = function () {
      showHide(false, false, true);
    };

    var addCsAdminToCustomer = function (encryptedParam) {
      csadminservice.setCsAdmin(encryptedParam, function (data) {
        if (data.success) {
          $scope.result.orgId = data.orgId;
          $scope.result.customerName = data.customerName;
          // $scope.result.contactName = data.customerAdminName;
          // $scope.result.contactEmail = data.customerAdminEmail;
          $scope.result.orderId = data.orderId;
          // $scope.result.partnerName = data.partnerName;
          // $scope.result.partnerContactName = data.partnerAdminName;
          // $scope.result.partnerContactEmail = data.partnerAdminEmail;
          if (data.csStatus === 'SUCCESS') {
            csAdminSuccess();
          } else {
            csAdminError();
          }
        } else {
          if (data.status === 400) {
            $scope.result.errmsg = 'Invalid link.';
            csAdminLinkExpire();
          }
          if (data.status === 403) {
            $scope.result.errmsg = 'Invalid Link.';
            csAdminLinkExpire();
          }
          if (data.status === 404) {
            $scope.result.errmsg = 'Invalid link.';
            csAdminLinkExpire();
          }
        }
      });
    };

    var encryptedParam = $location.search().eqp;

    if (encryptedParam) {
      addCsAdminToCustomer(encryptedParam);
    } else {
      $scope.result.errmsg = 'Invalid link. no param';
      csAdminLinkExpire();
      Log.error($scope.result.errmsg);
    }
  }
})();
