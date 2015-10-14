'use strict';

angular.module('Mediafusion')
  .controller('ConnectorDetailsController',

    /* @ngInject */
    function ($scope, $state, $stateParams, MediafusionProxy, MediafusionClusterService, $log, Notification, $translate) {
      $scope.visibleAlarm = {};
      $scope.clusters = [];
      $scope.selectedCluster = '';
      $scope.displayName = '';
      $scope.$watch(MediafusionProxy.getClusters, function (data) {
        $scope.connector = _.find(data.clusters || [], function (c) {
          return c.id == $stateParams.connectorId;
        });
        if (data.error || !$scope.connector) {
          $state.sidepanel.close();
        }
      }, true);

      if (!angular.equals($stateParams.groupName, {})) {
        $scope.displayName = $stateParams.groupName;
      }

      //$scope.groups = MediafusionClusterService.getGroups();
      var groupResponse = MediafusionClusterService.getGroups();
      groupResponse.then(function () {
        _.chain(groupResponse)
          .filter(function (group) {
            $scope.groups = group.value;
          })
          .value();
        //$log.log("List of groups:", $scope.groups);
      });

      $scope.onSelect = function ($item, $model, $label) {
        $scope.currentPropertySet = _.chain($scope.groups)
          .filter(function (group) {
            //$log.log('group  :', group);
            //$log.log("id :", group.id); 
            //$log.log("name :", group.name); 
            if (angular.equals(group.name, $scope.displayName)) {
              //$log.log("match found for group name");
              $scope.currentPropertySetId = group.id;
              return group;
            }
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
          //var responsePromise = 
          MediafusionClusterService.updateGroupAssignment($stateParams.connectorId, $item.id)
            .success(function (data) {
              $log.log("success data :", data);
              Notification.notify([$translate.instant('mediaFusion.groupAssignmentSuccess')], 'success');
            })
            .error(function (data, status) {
              $log.log("error data :", data);
              $log.log("error message :", data.message);
              $log.log("error status :", status);
              if (status === 404) {
                Notification.notify([$translate.instant('mediaFusion.groupAssignmentFailure', {
                  failureMessage: data.message
                })], 'error');
              }
            });
          //responsePromise.
          //$log.log("response:". response);
        });
      };
    }
  );
