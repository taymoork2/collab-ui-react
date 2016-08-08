(function () {
  'use strict';

  angular.module('Mediafusion')
    .controller('ConnectorDetailsController',

      /* @ngInject */
      function ($scope, $state, $stateParams, MediafusionProxy, MediafusionClusterService, Notification) {
        $scope.visibleAlarm = {};
        $scope.clusters = [];
        $scope.selectedCluster = '';
        $scope.displayName = '';
        $scope.clusterVal = '';
        $scope.newGrpId = '';
        $scope.newPropertySet = '';
        $scope.currentPropertySet = '';
        $scope.oldClusterVal = '';
        $scope.roleSelected = '';
        $scope.displayName1 = "Initial";

        $scope.$watch(MediafusionProxy.getClusters, function (data) {
          $scope.connector = _.find(data.clusters || [], function (c) {
            $scope.selectedCluster = $stateParams.connectorId;
            return c.id == $stateParams.connectorId;
          });
          if (data.error || !$scope.connector) {
            $state.sidepanel.close();
          }
        }, true);

        if (!angular.equals($stateParams.groupName, {})) {
          $scope.displayName = $stateParams.groupName;
        }

        if (!angular.equals($stateParams.roleSelected, {})) {
          $scope.roleSelected = $stateParams.roleSelected;
        }

        function getGroups() {
          var groupResponse = MediafusionClusterService.getGroups();
          groupResponse.then(function () {
            _.forEach(groupResponse, function (group) {
              $scope.groups = group.value;
            });
          });
        }
        getGroups();

        $scope.onEnter = function ($event, $item) {
          $event.stopPropagation();
          if ($event.keyCode === 13) {
            $scope.showbutton = true;
            $scope.clusterVal = $item;
          }
        };

        $scope.resetCluster = function () {
          $scope.displayName = $scope.oldClusterVal;
          $scope.showbutton = false;
        };

        $scope.changeRole = function ($selectedRole) {
          MediafusionClusterService.changeRole($selectedRole, $scope.selectedCluster)
            .success(function () {
              Notification.success('mediaFusion.roleAssignmentSuccess');
            })
            .error(function (data) {
              Notification.error('mediaFusion.roleAssignmentFailure', {
                failureMessage: data.message
              });
            });
        };

        $scope.updateCluster = function ($name, $event) {
          $event.stopPropagation();
          if ($event.offsetX !== 0 && $event.clientX !== 0) {
            $scope.showbutton = false;
            $scope.oldClusterVal = $scope.displayName;
            /*$scope.currentPropertySet = _.chain($scope.groups)
              .filter(function (group) {
                if (angular.equals(group.name, $scope.displayName)) {
                  $scope.currentPropertySetId = group.id;
                  return group;
                }
              })
              .value();*/
            $scope.currentPropertySet = _.find($scope.groups, function (group) {
              return group.name == $scope.displayName;
            });

            if ($scope.currentPropertySet.length === 0) {
              var resp = MediafusionClusterService.createGroup($name);
              resp.finally(function () {
                $scope.displayName = $scope.clusterVal;
                MediafusionClusterService.updateGroupAssignment($stateParams.connectorId, resp.$$state.value.data.id)
                  .success(function () {
                    $scope.oldClusterVal = $name;
                    Notification.success('mediaFusion.groupAssignmentSuccess');
                  })
                  .error(function (data) {
                    Notification.error('mediaFusion.groupAssignmentFailure', {
                      failureMessage: data.message
                    });
                  });
              });
            } else {
              $scope.displayName = $scope.clusterVal;
              // First check if the new value has an entry in group
              /*$scope.newPropertySet = _.chain($scope.groups)
                .filter(function (group) {
                  if (angular.equals(group.name, $scope.displayName)) {
                    $scope.newPropertySetId = group.id;
                    return group;
                  }
                })
                .value();*/
              $scope.newPropertySet = _.find($scope.groups, function (group) {
                return group.name == $scope.displayName;
              });
              if ($scope.newPropertySet === undefined || $scope.newPropertySet === '') {
                var createPromise = MediafusionClusterService.createGroup($scope.clusterVal);
                createPromise.finally(function () {
                  getGroups();
                  MediafusionClusterService.removeGroupAssignment($stateParams.connectorId, $scope.currentPropertySet.id)
                    .success(function () {
                      MediafusionClusterService.updateGroupAssignment($stateParams.connectorId, createPromise.$$state.value.data.id)
                        .success(function () {
                          $scope.oldClusterVal = $name;
                          Notification.success('mediaFusion.groupAssignmentSuccess');
                        })
                        .error(function (data) {
                          Notification.error('mediaFusion.groupAssignmentFailure', {
                            failureMessage: data.message
                          });
                        });
                    })
                    .error(function (data) {
                      Notification.error('mediaFusion.groupAssignmentFailure', {
                        failureMessage: data.message
                      });
                    });

                });
              } else {
                var promise = MediafusionClusterService.removeGroupAssignment($stateParams.connectorId, $scope.currentPropertySet.id);
                promise.finally(function () {
                  //Check if new cluster has a valid cluster id
                  MediafusionClusterService.updateGroupAssignment($stateParams.connectorId, $scope.newGrpId)
                    .success(function () {
                      $scope.oldClusterVal = $name;
                      Notification.success('mediaFusion.groupAssignmentSuccess');
                    })
                    .error(function (data) {
                      Notification.success('mediaFusion.groupAssignmentFailure', {
                        failureMessage: data.message
                      });
                    });
                });
              }

            }
          }

        };

        $scope.onSelect = function ($item) {
          $scope.showbutton = true;
          $scope.clusterVal = $item.name;
          $scope.newGrpId = $item.id;
          $scope.oldClusterVal = $scope.displayName;
        };
      }
    );
})();
