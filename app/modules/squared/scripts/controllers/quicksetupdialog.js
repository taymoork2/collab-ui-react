'use strict';

angular.module('Squared')
  .controller('quicksetupDialogCtrl', quicksetupDialogCtrl);

/* @ngInject */
function quicksetupDialogCtrl($scope, $modalInstance, data, $rootScope, $translate, $location, Utils, $state) {
  $scope.cancel = function () {
    $modalInstance.dismiss('canceled');
  };

  $scope.buttonLabel = $translate.instant('common.ok');

  $scope.doAction = function () {
    if ($scope.inviteAll) {
      $rootScope.selectedSubTab = 'invite';
      $state.go('users');
    }
    $modalInstance.dismiss('canceled');
  };

  $scope.toggleButton = function () {
    if ($scope.inviteAll) {
      $scope.buttonLabel = $translate.instant('common.next');
    } else {
      $scope.buttonLabel = $translate.instant('common.ok');
    }
  };

}
