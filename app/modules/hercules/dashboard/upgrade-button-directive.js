(function () {
  'use strict';
  angular
    .module('Hercules')
    .controller('UpgradeButtonController', ['$scope', '$attrs', function ($scope, $attrs) {
      $scope.inflight = false;
      $scope.upgradeClicked = function () {
        $scope.inflight = true;
        $scope.upgradeSoftware($attrs.clusterId, $attrs.serviceType, function () {
          $scope.inflight = false;
        });
      }
    }])
    .directive('herculesUpgradeButton', [
      function () {
        return {
          restrict: 'EA',
          scope: false,
          controller: 'UpgradeButtonController',
          templateUrl: 'modules/hercules/dashboard/upgrade-button.html'
        };
      }
    ]);
})();
