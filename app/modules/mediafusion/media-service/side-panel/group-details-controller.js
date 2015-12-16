'use strict';

angular.module('Mediafusion')
  .controller('GroupDetailsController',

    /* @ngInject */
    function ($scope, $state, $stateParams, MediaClusterService, $log, Notification, $translate) {

      var vm = this;
      vm.displayName = null;
      vm.clusterList = null;
      vm.groups = null;
      vm.showbutton = true;
      vm.clusterVal = null;
      vm.visibleAlarm = {};
      vm.displayName = '';
      vm.clusterVal = '';
      vm.newGrpId = '';
      vm.newPropertySet = '';
      vm.currentPropertySet = '';
      vm.oldClusterVal = '';
      vm.displayName1 = "Initial";

      if (!angular.equals($stateParams.groupName, {})) {
        vm.displayName = $stateParams.groupName;
      }

      if (!angular.equals($stateParams.selectedClusters, {})) {
        vm.clusterList = $stateParams.selectedClusters;
      }

      $log.log("Clusters", vm.clusterList);

      vm.alarmsSummary = function () {
        $log.log("im in");
        $log.log("list size", vm.clusterList.length);
        var alarms = {};

        _.forEach(vm.clusterList, function (cluster) {
          _.forEach(cluster.services[0].connectors[0].alarms, function (alarm) {
            if (!alarms[alarm.id]) {
              alarms[alarm.id] = {
                alarm: alarm,
                hosts: []
              };
            }
            alarms[alarm.id].hosts.push(cluster.hosts[0].host_name);
          });
        });
        // var mappedAlarms = _.toArray(alarms);
        // $log.log("Alarms",mappedAlarms);
        return _.toArray(alarms);
      };

      vm.alarms = vm.alarmsSummary();

      vm.getGroups = function () {
        var groupResponse = MediaClusterService.getGroups();
        groupResponse.then(function () {
          _.chain(groupResponse)
            .filter(function (group) {
              vm.groups = group.value;
            })
            .value();
        });
      };
      //getGroups();

      vm.onEnter = function ($event, $item) {
        $event.stopPropagation();
        if ($event.keyCode === 13) {
          vm.showbutton = true;
          vm.clusterVal = $item;
          // $log.log("The value in enter is ", $scope.clusterVal);
        }
      };

      vm.resetCluster = function () {
        vm.displayName = vm.oldClusterVal;
        vm.showbutton = false;
      };

      vm.updateCluster = function ($name, $event) {
        // $log.log($event);
        // $log.log("name in update", $name);
        // $log.log("the vvalue in $scope.clusterVal is", $scope.clusterVal);
        // $log.log("displayname in update", $scope.displayName);
        $event.stopPropagation();
        if ($event.offsetX !== 0 && $event.clientX !== 0) {
          // $log.log("entered autosave");
          vm.showbutton = false;
          vm.oldClusterVal = vm.displayName;
          /*$scope.currentPropertySet = _.chain($scope.groups)
            .filter(function (group) {
              if (angular.equals(group.name, $scope.displayName)) {
                $scope.currentPropertySetId = group.id;
                return group;
              }
            })
            .value();*/
          vm.currentPropertySet = _.find(vm.groups, function (group) {
            return group.name == vm.displayName;
          });

          if (vm.currentPropertySet.length === 0) {
            var resp = MediaClusterService.createGroup($name);
            resp.finally(function () {
              vm.displayName = vm.clusterVal;
              MediaClusterService.updateGroupAssignment($stateParams.connectorId, resp.$$state.value.data.id)
                .success(function (data) {
                  vm.oldClusterVal = $name;
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
            vm.displayName = vm.clusterVal;
            // First check if the new value has an entry in group
            /*$scope.newPropertySet = _.chain($scope.groups)
              .filter(function (group) {
                if (angular.equals(group.name, $scope.displayName)) {
                  $scope.newPropertySetId = group.id;
                  return group;
                }
              })
              .value();*/
            vm.newPropertySet = _.find(vm.groups, function (group) {
              return group.name == vm.displayName;
            });
            if (vm.newPropertySet === undefined || vm.newPropertySet === '') {
              var createPromise = MediaClusterService.createGroup(vm.clusterVal);
              createPromise.finally(function () {
                vm.getGroups();
                MediaClusterService.removeGroupAssignment($stateParams.connectorId, vm.currentPropertySet.id)
                  .success(function (data) {
                    // $log.log("Removal success");
                    MediaClusterService.updateGroupAssignment($stateParams.connectorId, createPromise.$$state.value.data.id)
                      .success(function (data) {
                        // $log.log("success data :", data);
                        vm.oldClusterVal = $name;
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
              var promise = MediaClusterService.removeGroupAssignment($stateParams.connectorId, vm.currentPropertySet.id);
              promise.finally(function () {
                //Check if new cluster has a valid cluster id
                MediaClusterService.updateGroupAssignment($stateParams.connectorId, vm.newGrpId)
                  .success(function (data) {
                    vm.oldClusterVal = $name;
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

      vm.onSelect = function ($item, $model, $label) {
        vm.showbutton = true;
        vm.clusterVal = $item.name;
        vm.newGrpId = $item.id;
        vm.oldClusterVal = vm.displayName;
        // $log.log("new grp id", $scope.newGrpId);
      };

    }
  );
