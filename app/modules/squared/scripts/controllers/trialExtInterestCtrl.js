'use strict';

angular.module('Squared')
  .controller('trialExtInterestCtrl', ['$scope', '$location', '$http', 'Log', 'TrialExtInterestService',

    function ($scope, $location, $http, Log, TrialExtInterestService) {

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
        TrialExtInterestService.notifyPartnerAdmin(encryptedParam, function (data, status) {
          if (data.success) {
            notifyPartnerSuccess();
          } else {
            if (data.status === 400 || data.status === 403 || data.status === 404) {
              notifyPartnerBadLink();
            } else {
              notifyPartnerError();
            }
          }
        });
      };

      var encryptedParam = $location.search().eqp;

      if (encryptedParam) {
        notifyPartner(encryptedParam);
      } else {
        $scope.result.errmsg = 'Invalid link. no param';
        notifyPartnerBadLink();
        Log.error($scope.result.errmsg);
      }
    }
  ]);
