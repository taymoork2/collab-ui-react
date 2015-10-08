'use strict';

angular.module('Mediafusion')
  .controller('ConnectorDetailsController',

    /* @ngInject */
    function ($scope, $state, $stateParams, MediafusionProxy, MediafusionClusterService) {
      $scope.visibleAlarm = {};
      $scope.clusters = [];
      $scope.selectedCluster = '';
      $scope.displayName = $stateParams.groupName;
      $scope.$watch(MediafusionProxy.getClusters, function (data) {
        $scope.connector = _.find(data.clusters || [], function (c) {
          return c.id == $stateParams.connectorId;
        });
        if (data.error || !$scope.connector) {
          $state.sidepanel.close();
        }
      }, true);

      $scope.groups = MediafusionClusterService.getGroups();

      $scope.selectGroup = function (group) {
        $scope.displayName = group.name;
      };
    }
  );
