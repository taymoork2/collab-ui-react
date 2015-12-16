'use strict';

angular.module('Mediafusion')
  .controller('HostDetailsController',

    /* @ngInject */
    function ($stateParams, $state, MediaClusterService, XhrNotificationService, Notification, $translate) {
      var vm = this;
      vm.clusterId = $stateParams.clusterId;
      vm.role = $stateParams.properties["mf.role"];
      vm.connector = $stateParams.connector;

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
            Notification.notify([$translate.instant('mediaFusion.roleAssignmentSuccess')], 'success');
          })
          .error(function (data, status) {
            Notification.notify([$translate.instant('mediaFusion.roleAssignmentFailure', {
              failureMessage: data.message
            })], 'error');
          });
      };
    }
  );
