(function () {
  'use strict';

  angular.module('Mediafusion')
    .controller('HostDetailsController',

      /* @ngInject */
      function ($stateParams, $state, MediaClusterService, XhrNotificationService, Notification, $modal) {
        var vm = this;
        vm.clusterId = $stateParams.clusterId;
        vm.role = $stateParams.properties["mf.role"];
        vm.connector = $stateParams.connector;
        vm.hostscount = $stateParams.hostLength;
        vm.cluster = MediaClusterService.getClusters()[vm.clusterId];
        vm.options = ["Switching", "Transcoding"];
        vm.selectPlaceholder = 'Select One';
        vm.organization = '';

        MediaClusterService.getOrganization(function (data, status) {
          if (data.success) {
            vm.organization = data;
          }
        });

        vm.reassignCluster = function () {
          $modal.open({
            resolve: {
              cluster: function () {
                return vm.cluster;
              }
            },
            controller: 'ReassignClusterController',
            controllerAs: "reassignClust",
            templateUrl: 'modules/mediafusion/media-service/side-panel/reassign-cluster-dialog.html'
          });
        };

        vm.deleteHost = function () {
          return MediaClusterService.deleteHost(vm.clusterId, vm.connector.host.serial).then(function () {
            if (MediaClusterService.getClusters()[vm.clusterId]) {
              $state.go('connector-details', {
                clusterId: vm.clusterId
              });
            } else {
              $state.sidepanel.close();
            }
          }, XhrNotificationService.notify);
        };

        vm.changeRole = function ($selectedRole, $clusterId) {
          MediaClusterService.changeRole($selectedRole, $clusterId)
            .success(function (data) {
              Notification.success('mediaFusion.roleAssignmentSuccess');
            })
            .error(function (data, status) {
              Notification.error('mediaFusion.roleAssignmentFailure', {
                failureMessage: data.message
              });
            });
        };

        vm.showDeregisterHostDialog = function () {
          if (vm.hostscount == 1) {
            $modal.open({
              resolve: {
                orgName: function () {
                  return vm.organization.displayName;
                },
                cluster: function () {
                  return vm.cluster;
                }

              },
              controller: 'HostClusterDeregisterController',
              controllerAs: "hostClusterDeregister",
              templateUrl: 'modules/mediafusion/media-service/side-panel/host-deregister-cluster-delete-dialog.html'
            });
          } else {
            $modal.open({
              resolve: {
                cluster: function () {
                  return vm.cluster;
                },
                orgName: function () {
                  return vm.organization.displayName;
                }
              },
              controller: 'HostDeregisterController',
              controllerAs: "hostDeregister",
              templateUrl: 'modules/mediafusion/media-service/side-panel/host-deregister-dialog.html'
            });
          }

        };

      }
    );
})();
