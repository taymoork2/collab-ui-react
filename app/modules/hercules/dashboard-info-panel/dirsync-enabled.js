(function () {
  'use strict';
  angular
    .module('Hercules')
    .controller('DirsyncEnabledController',

      /* @ngInject */
      function ($scope, $state, DirSyncService) {
        $scope.dirsyncEnabled = true;
        DirSyncService.getDirSyncStatus(function (data) {
          $scope.dirsyncEnabled = data.success && data.serviceMode == 'ENABLED';
          if (!$scope.dirsyncEnabled) $scope.showInfoPanel = true;
        });

        $scope.navigateToDirsync = function () {
          $state.go('setupwizardmodal', {
            currentTab: 'addUsers'
          });
        };

      }

    )
    .directive('herculesDirsyncEnabled', [
      function () {
        return {
          scope: false,
          restrict: 'E',
          controller: 'DirsyncEnabledController',
          templateUrl: 'modules/hercules/dashboard-info-panel/dirsync-enabled.html'
        };
      }
    ]);
})();
