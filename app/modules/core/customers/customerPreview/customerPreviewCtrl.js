'use strict';

/* global $ */

angular.module('Core')
  .controller('CustomerPreviewCtrl', ['$scope', '$state',
    function ($scope, $state) {

      $scope.closePreview = function () {
        $state.go('partnercustomers.list');
      };

      $scope.openEditTrialModal = function () {
        $state.go('trialEdit', {
          currentTrial: $scope.currentTrial,
          showPartnerEdit: true
        });
      };
    }
  ]);
