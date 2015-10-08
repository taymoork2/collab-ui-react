'use strict';

angular.module('Mediafusion')
  .controller('ConnectorDetailsController',

    /* @ngInject */
    function ($scope, $state, $stateParams, MediafusionProxy, MediafusionClusterService, $log) {
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

      $scope.onSelect = function ($item, $model, $label) {
        $scope.currentPropertySet = _.chain($scope.groups)
          .filter(function (group) {
            //$log.log('group length :', group.value.length);
            angular.forEach(group.value, function (item) {
              //$log.log("id :", item.id); 
              //$log.log("name :", item.name); 
              if (angular.equals(item.name, $scope.displayName)) {
                //$log.log("match found");
                $scope.currentPropertySetId = item.id;
                return group.value;
              }
            });
          })
          .value();

        //$log.log("currentPropertySet: ", $scope.currentPropertySet);
        //$log.log("currentPropertySetId: ", $scope.currentPropertySetId);
        //$log.log('selected group name :', $item.name);
        //$log.log('selected group id :', $item.id);
        //$log.log('selected properties :', $item.properties);
        //$log.log('selected properties value:', $item.properties["mf.group.displayName"]);

        $scope.displayName = $item.name;
        var promise = MediafusionClusterService.removeGroupAssignment($stateParams.connectorId, $scope.currentPropertySetId);
        promise.finally(function () {
          MediafusionClusterService.updateGroupAssignment($stateParams.connectorId, $item.id);
        });
      };
    }
  );
