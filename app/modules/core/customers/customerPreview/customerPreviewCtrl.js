'use strict';

angular.module('Core')
  .controller('CustomerPreviewCtrl', ['$scope', '$state',
    function ($scope, $state) {

      $scope.closePreview = function () {
        $state.go('partnercustomers.list');
      };

      $scope.openEditTrialModal = function () {
        $state.go('trialEdit.info', {
          currentTrial: $scope.currentTrial,
          showPartnerEdit: true
        }).then(function () {
          $state.modal.result.then(function () {
            $state.go('partnercustomers.list', {}, {
              reload: true
            });
          });
        });
      };

    }
  ]);
