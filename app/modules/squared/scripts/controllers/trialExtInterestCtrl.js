(function () {
  'use strict';

  angular
    .module('Squared')
    .controller('TrialExtInterestCtrl', TrialExtInterestCtrl);

  /* @ngInject */
  function TrialExtInterestCtrl($scope, $location, $http, $translate, Log, TrialExtInterestService) {

    //initialize ng-show variables
    $scope.result = {
      success: false,
      error: false
    };

    var showHide = function (success, badLink, error) {
      $scope.result.success = success;
      $scope.result.badLink = badLink;
      $scope.result.error = error;
    };

    var notifyPartnerSuccess = function () {
      showHide(true, false, false);
    };

    var notifyPartnerBadLink = function () {
      showHide(false, true, false);
    };

    var notifyPartnerError = function () {
      showHide(false, false, true);
    };

    var notifyPartner = function (encryptedParam) {
      TrialExtInterestService.notifyPartnerAdmin(encryptedParam)
        .success(function (data, status) {
          notifyPartnerSuccess();
        })
        .error(function (data, status) {
          if (status === 400 || status === 403 || status === 404) {
            notifyPartnerBadLink();
          } else {
            notifyPartnerError();
          }
        });
    };

    var encryptedParam = $location.search().eqp;
    if (encryptedParam) {
      notifyPartner(encryptedParam);
    } else {
      $scope.result.errmsg = $translate.instant('trialExtInterest.invalidLinkNoParam');
      notifyPartnerBadLink();
      Log.error($scope.result.errmsg);
    }
  }
})();
