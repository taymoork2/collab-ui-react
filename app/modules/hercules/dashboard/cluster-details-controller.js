'use strict';

angular.module('Hercules')
  .controller('ClusterDetailsController',

    /* @ngInject */
    function ($scope, $state, $stateParams, ConnectorService, ClusterProxy) {
      $scope.visibleAlarm = {};

      $scope.$watch(ClusterProxy.getClusters, function (data) {
        $scope.cluster = _.find(data.clusters || [], function (c) {
          return c.id == $stateParams.clusterId;
        });
        if (data.error || !$scope.cluster) {
          $state.sidepanel.close();
        }
      }, true);

    }
  );
