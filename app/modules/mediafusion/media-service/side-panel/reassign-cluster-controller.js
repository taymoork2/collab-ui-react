(function () {
  'use strict';

  /* @ngInject */
  function ReassignClusterController(cluster, MediaClusterService, XhrNotificationService, $translate, $modalInstance) {
    var vm = this;

    vm.options = [];
    vm.selectPlaceholder = 'Select a Cluster';
    vm.selectedCluster = '';
    vm.groups = null;
    vm.groupResponse = null;
    vm.groupDetail = null;

    vm.getGroups = function () {
      vm.groupResponse = MediaClusterService.getGroups().then(function (group) {
        vm.groups = group;
        _.each(group, function (group) {
          vm.options.push(group.name);
        });
      });
    };
    vm.getGroups();

    vm.reassignText = $translate.instant(
      'mediaFusion.reassign.reassignText', {
        clusterName: cluster.name,
        displayName: cluster.properties["mf.group.displayName"]
      });
    vm.saving = false;

    vm.reassign = function () {
      vm.saving = true;

      _.each(vm.groups, function (group) {
        if (group.name == vm.selectedCluster) {
          vm.groupDetail = group;
        }
      });

      MediaClusterService
        .removeGroupAssignment(cluster.id, cluster.assigned_property_sets[0])
        .then(function () {
          MediaClusterService
            .updateGroupAssignment(cluster.id, vm.groupDetail.id)
            .then(function () {
              $modalInstance.close();
              vm.saving = false;
            }, function (err) {
              vm.error = $translate.instant('mediaFusion.reassign.reassignErrorMessage', {
                hostName: vm.selectedCluster,
                errorMessage: XhrNotificationService.getMessages(err).join(', ')
              });
              vm.saving = false;
            });
        }, function (err) {
          vm.error = $translate.instant('mediaFusion.reassign.reassignErrorMessage', {
            hostName: vm.selectedCluster,
            errorMessage: XhrNotificationService.getMessages(err).join(', ')
          });
          vm.saving = false;
        });
      return false;
    };

    vm.close = $modalInstance.close;
  }

  angular
    .module('Mediafusion')
    .controller('ReassignClusterController', ReassignClusterController);

}());
