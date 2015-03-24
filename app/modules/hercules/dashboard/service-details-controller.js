'use strict';

angular.module('Hercules')
  .controller('ServiceDetailsController',

    /* @ngInject */
    function ($scope, $modal, $rootScope, $state, $stateParams, ConnectorService) {
      $scope.service = $stateParams.service;

      $scope.showUpgradeDialog = function (upgradePackage, cluster, currentVersion) {
        $scope.upgradePackage = upgradePackage;
        $scope.cluster = cluster;
        $scope.currentVersion = currentVersion;
        $scope.upgradeModal = $modal.open({
          scope: $scope,
          controller: 'SWUpgradeController',
          templateUrl: 'modules/hercules/sw-upgrade/upgrade-dialog.html'
        });
      };
    }

  );
