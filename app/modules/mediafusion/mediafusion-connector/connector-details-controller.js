(function () {
  'use strict';

  angular.module('Mediafusion')
    .controller('ConnectorDetailsController',

      /* @ngInject */
      function ($scope, $state, $stateParams, MediafusionProxy, MediafusionClusterService, Notification, $translate) {
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
            _.chain(groupResponse)
              .filter(function (group) {
                $scope.groups = group.value;
              })
              .value();
          });
        }
        getGroups();

        $scope.onEnter = function ($event, $item) {
          $event.stopPropagation();
          if ($event.keyCode === 13) {
            $scope.showbutton = true;
            $scope.clusterVal = $item;
            // $log.log("The value in enter is ", $scope.clusterVal);
          }
        };

        $scope.resetCluster = function () {
          $scope.displayName = $scope.oldClusterVal;
          $scope.showbutton = false;
        };

        $scope.changeRole = function ($selectedRole) {
          // $log.log("The new value is ", $selectedRole);
          // $log.log("The value of selectedCluster is", $scope.selectedCluster);
          MediafusionClusterService.changeRole($selectedRole, $scope.selectedCluster)
            .success(function (data) {
              Notification.notify([$translate.instant('mediaFusion.roleAssignmentSuccess')], 'success');
            })
            .error(function (data, status) {
              Notification.notify([$translate.instant('mediaFusion.roleAssignmentFailure', {
                failureMessage: data.message
              })], 'error');
            });
        };

        $scope.updateCluster = function ($name, $event) {
          // $log.log($event);
          // $log.log("name in update", $name);
          // $log.log("the vvalue in $scope.clusterVal is", $scope.clusterVal);
          // $log.log("displayname in update", $scope.displayName);
          $event.stopPropagation();
          if ($event.offsetX !== 0 && $event.clientX !== 0) {
            // $log.log("entered autosave");
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
                  .success(function (data) {
                    $scope.oldClusterVal = $name;
                    Notification.notify([$translate.instant('mediaFusion.groupAssignmentSuccess')], 'success');
                  })
                  .error(function (data, status) {
                    Notification.notify([$translate.instant('mediaFusion.groupAssignmentFailure', {
                      failureMessage: data.message
                    })], 'error');
                  });
              });
            } else {
              // $log.log("inside else bloc");
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
                    .success(function (data) {
                      // $log.log("Removal success");
                      MediafusionClusterService.updateGroupAssignment($stateParams.connectorId, createPromise.$$state.value.data.id)
                        .success(function (data) {
                          // $log.log("success data :", data);
                          $scope.oldClusterVal = $name;
                          Notification.notify([$translate.instant('mediaFusion.groupAssignmentSuccess')], 'success');
                        })
                        .error(function (data, status) {
                          // $log.log("error data :", data);
                          // $log.log("error message :", data.message);
                          // $log.log("error status :", status);
                          Notification.notify([$translate.instant('mediaFusion.groupAssignmentFailure', {
                            failureMessage: data.message
                          })], 'error');
                        });
                    })
                    .error(function (data) {
                      Notification.notify([$translate.instant('mediaFusion.groupAssignmentFailure', {
                        failureMessage: data.message
                      })], 'error');
                    });

                });
              } else {
                var promise = MediafusionClusterService.removeGroupAssignment($stateParams.connectorId, $scope.currentPropertySet.id);
                promise.finally(function () {
                  //Check if new cluster has a valid cluster id
                  MediafusionClusterService.updateGroupAssignment($stateParams.connectorId, $scope.newGrpId)
                    .success(function (data) {
                      $scope.oldClusterVal = $name;
                      Notification.notify([$translate.instant('mediaFusion.groupAssignmentSuccess')], 'success');
                    })
                    .error(function (data, status) {
                      Notification.notify([$translate.instant('mediaFusion.groupAssignmentFailure', {
                        failureMessage: data.message
                      })], 'error');
                    });
                });
              }

            }
          }

        };

        $scope.onSelect = function ($item, $model, $label) {
          $scope.showbutton = true;
          $scope.clusterVal = $item.name;
          $scope.newGrpId = $item.id;
          $scope.oldClusterVal = $scope.displayName;
          // $log.log("new grp id", $scope.newGrpId);
        };
      }
    );
})();
