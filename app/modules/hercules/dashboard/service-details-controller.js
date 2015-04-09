'use strict';

angular.module('Hercules')
  .controller('ServiceDetailsController',

    /* @ngInject */
    function ($scope, $modal, $rootScope, $state, $stateParams, ClusterProxy) {

      $scope.$watch(ClusterProxy.getClusters, function (data) {
        if (data.error) return $state.sidepanel.close();

        var cluster = _.find(data.clusters || [], function (c) {
          return c.id == $stateParams.clusterId;
        });

        if (!cluster) return $state.sidepanel.close();

        $scope.service = _.find(cluster.services, function (s) {
          return s.service_type == $stateParams.serviceType;
        });

        if (!$scope.service) return $state.sidepanel.close();
      }, true);

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
