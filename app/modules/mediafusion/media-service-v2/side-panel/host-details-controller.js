(function () {
  'use strict';

  angular.module('Mediafusion')
    .controller('HostDetailsControllerV2',

      /* @ngInject */
      function ($stateParams, $state, MediaClusterServiceV2, XhrNotificationService, $modal) {
        var vm = this;
        vm.clusterId = $stateParams.clusterId;
        vm.connector = $stateParams.connector;
        vm.hostscount = $stateParams.hostLength;
        vm.cluster = MediaClusterServiceV2.getClusters()[vm.clusterId];
        vm.options = ["Switching", "Transcoding"];
        vm.selectPlaceholder = 'Select One';
        vm.organization = '';

        MediaClusterServiceV2.getOrganization(function (data, status) {
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
            controller: 'ReassignClusterControllerV2',
            controllerAs: "reassignClust",
            templateUrl: 'modules/mediafusion/media-service-v2/side-panel/reassign-cluster-dialog.html'
          });
        };

        vm.deleteHost = function () {
          return MediaClusterServiceV2.deleteHost(vm.clusterId, vm.connector.host.serial).then(function () {
            if (MediaClusterServiceV2.getClusters()[vm.clusterId]) {
              $state.go('connector-details', {
                clusterId: vm.clusterId
              });
            } else {
              $state.sidepanel.close();
            }
          }, XhrNotificationService.notify);
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
              type: 'dialog',
              controller: 'HostClusterDeregisterControllerV2',
              controllerAs: "hostClusterDeregister",
              templateUrl: 'modules/mediafusion/media-service-v2/side-panel/host-deregister-cluster-delete-dialog.html'
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
              type: 'dialog',
              controller: 'HostDeregisterControllerV2',
              controllerAs: "hostDeregister",
              templateUrl: 'modules/mediafusion/media-service-v2/side-panel/host-deregister-dialog.html'
            });
          }

        };

      }
    );
})();
