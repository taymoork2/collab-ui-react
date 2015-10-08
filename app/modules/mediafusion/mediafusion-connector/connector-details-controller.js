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
        $log.log("$scope.groups :", $scope.groups);
        //var groupList = $scope.groups.value;
        //$log.log("$groupList :", groupList);
        $scope.currentPropertySetId = _.chain(scope.groups)
          .filter(function (group) {
            $log.log('group :', group);
            $log.log('group value :', group.value);
            $log.log('group name :', group.value["name"]); 
            return group.value.name == $scope.displayName;
          })
          .pluck('id')
          .compact()
          .first()
          .value();

        $scope.displayName = $item.name;
        $log.log('selected group name :', $item.name);
        $log.log('selected group id :', $item.id);
        $log.log('selected properties :', $item.properties);
        $log.log('selected properties value:', $item.properties["mf.group.displayName"]);
        $log.log("currentPropertySetId: ", $scope.currentPropertySetId);
        MediafusionClusterService.updateGroupAssignment($stateParams.connectorId, $item.id);

      };

    }
  );
