'use strict';

angular.module('Hercules')
  .controller('HostDetailsController',

    /* @ngInject */
    function ($scope, $state, $stateParams, ClusterProxy) {

      $scope.$watch(ClusterProxy.getClusters, function (data) {
        if (data.error) return $state.sidepanel.close();

        var cluster = _.find(data.clusters || [], function (c) {
          return c.id == $stateParams.clusterId;
        });

        if (!cluster) return $state.sidepanel.close();

        $scope.host = _.find(cluster.hosts, function (h) {
          return h.serial == $stateParams.hostSerial;
        });

        if (!$scope.host) return $state.sidepanel.close();
      }, true);

      $scope.deleteHost = function (clusterId, serial) {
        $scope.deleteHostInflight = true;
        ClusterProxy.deleteHost(clusterId, serial, function () {
          $scope.deleteHostInflight = false;
        });
      };

    }

  );
