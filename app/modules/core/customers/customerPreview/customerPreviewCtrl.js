'use strict';

/* global $ */

angular.module('Core')
  .controller('CustomerPreviewCtrl', ['$scope', '$rootScope', '$state', 'Log', '$window', '$modal', 'PartnerService', 'Notification',
    function ($scope, $rootScope, $state, Log, $window, $modal, PartnerService, Notification) {
      $scope.licenseDuration = 30;
      $scope.licenseCount = 50;
      $scope.showPartnerEdit = true;

      $scope.formReset = function () {
        $scope.licenseDuration = 30;
        $scope.licenseCount = 50;
      };

      $scope.closePreview = function () {
        $state.go('partnercustomers.list');
      };

      $scope.openEditTrialModal = function () {
        $scope.partnerEdit = true;
        $scope.editTrialModalInstance = $modal.open({
          templateUrl: 'modules/core/views/editTrialModal.tpl.html',
          controller: 'PartnerHomeCtrl',
          scope: $scope
        });
      };

      $scope.editTrial = function () {
        var createdDate = new Date();
        angular.element('#saveSendButton').button('loading');
        PartnerService.editTrial($scope.licenseDuration, $scope.currentTrial.trialId, $scope.licenseCount, $scope.currentTrial.usage, $scope.currentTrial.customerOrgId, function (data, status) {
          angular.element('#saveSendButton').button('reset');
          if (data.success === true) {
            $scope.editTrialModalInstance.close();
            var successMessage = ['You have successfully edited a trial for ' + $scope.currentTrial.customerName + ' with ' + $scope.licenseCount + ' licenses ' + ' for ' + $scope.licenseDuration + ' days.'];
            Notification.notify(successMessage, 'success');
          } else {
            Notification.notify([data.message], 'error');
          }
        });
      };
    }
  ]);
