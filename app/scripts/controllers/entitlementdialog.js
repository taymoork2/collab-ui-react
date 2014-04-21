'use strict';

angular.module('wx2AdminWebClientApp')
  .controller('entitlementDialogCtrl', ['$scope', '$modalInstance', 'data',
    function($scope, $modalInstance, data) {
      $scope.username = data.userName;
      $scope.entitlements = {};
      if (!data.entitlements || data.entitlements.length === 0) {
        $scope.entitlements.webExSquared = false;
        $scope.entitlements.squaredCallInitiation = false;
      } else {
        $scope.entitlements.webExSquared = data.entitlements.indexOf('webex-squared') > -1;
        $scope.entitlements.squaredCallInitiation = data.entitlements.indexOf('squared-call-initiation') > -1;
      }

      $scope.cancel = function() {
        $modalInstance.dismiss('canceled');
      };

      $scope.save = function() {

        if (!$scope.entitlements.webExSquared) {
          $scope.entitlements.squaredCallInitiation = false;
        }

        $modalInstance.close($scope.entitlements);
      };

    }
  ]);
