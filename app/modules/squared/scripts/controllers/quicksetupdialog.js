'use strict';

angular.module('Squared')
  .controller('quicksetupDialogCtrl', ['$scope', '$modalInstance', 'data', '$rootScope', '$translate', '$location', 'Utils',
    function($scope, $modalInstance, data, $rootScope, $translate, $location, Utils) {
      $scope.cancel = function() {
        $modalInstance.dismiss('canceled');
      };

      $scope.inviteAll = false;
      $scope.buttonLabel = $translate.instant('common.ok');

      $scope.doAction = function() {
        if ($scope.inviteAll)
        {
          $rootScope.selectedSubTab = 'invite';
          Utils.changeTab('/users');
        }
        $modalInstance.dismiss('canceled');
      };

      $scope.toggleButton = function() {
        if (!$scope.inviteAll)
        {
          $scope.inviteAll = true;
          $scope.buttonLabel = $translate.instant('common.next');
        }
        else
        {
          $scope.inviteAll = false;
          $scope.buttonLabel = $translate.instant('common.ok');
        }
      };

    }
  ]);
