(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('ResourceGroupSettingsController', ResourceGroupSettingsController);

  /* @ngInject */
  function ResourceGroupSettingsController($stateParams, ResourceGroupService, Notification, $translate, $state, FusionClusterService, $modal) {
    var vm = this;
    vm.backUrl = 'cluster-list';
    vm.clusters = {
      title: 'hercules.resourceGroupSettings.clustersHeader'
    };
    vm.users = {
      title: 'hercules.resourceGroupSettings.usersHeader'
    };
    vm.resourceGroup = {
      title: 'hercules.resourceGroups.resourceGroupHeading'
    };
    vm.allowRemove = false;
    vm.setGroupName = setGroupName;
    vm.openDeleteGroupModal = openDeleteGroupModal;
    vm.openAssignClustersModal = openAssignClustersModal;
    vm.handleKeypress = handleKeypress;
    vm.showResetSection = false;

    loadResourceGroup($stateParams.id);
    determineIfRemoveAllowed();

    function loadResourceGroup(resourceGroupId) {
      ResourceGroupService.get(resourceGroupId)
        .then(function (group) {
          vm.group = group;
          vm.newGroupName = group.name;
          vm.localizedTitle = $translate.instant('hercules.resourceGroupSettings.pageTitle', {
            groupName: group.name
          });
        })
        .catch(function (error) {
          Notification.errorWithTrackingId(error, 'hercules.resourceGroupSettings.loadFailed');
        });
    }

    function determineIfRemoveAllowed() {
      FusionClusterService.getAll()
        .then(function (clusters) {
          vm.allowRemove = _.every(clusters, function (c) {
            return c.resourceGroupId !== $stateParams.id;
          });
        }, _.noop);
    }

    function setGroupName(newName) {
      if (newName.length === 0) {
        Notification.error('hercules.resourceGroupSettings.groupNameCannotByEmpty');
        return;
      }
      ResourceGroupService.setName(vm.group.id, newName)
        .then(function () {
          vm.group.name = newName;
          vm.localizedTitle = $translate.instant('hercules.resourceGroupSettings.pageTitle', {
            groupName: newName
          });
          Notification.success('hercules.resourceGroupSettings.groupNameSaved');
        }, function (response) {
          if (response.status === 409) {
            Notification.errorWithTrackingId(response, 'hercules.resourceGroupSettings.duplicateName');
          } else {
            Notification.errorWithTrackingId(response, 'hercules.genericFailure');
          }
        });
    }

    function openDeleteGroupModal() {
      $modal.open({
        resolve: {
          resourceGroup: function () {
            return vm.group;
          }
        },
        controller: 'ConfirmDeleteResourceGroupController',
        controllerAs: 'vm',
        templateUrl: 'modules/hercules/fusion-pages/resource-group-settings/confirm-delete-resource-group.html',
        type: 'dialog'
      }).result.then(function () {
        $state.go('cluster-list');
      });
    }

    function openAssignClustersModal() {
      $modal.open({
        resolve: {
          resourceGroup: function () {
            return vm.group;
          }
        },
        controller: 'AssignClustersController',
        controllerAs: 'vm',
        templateUrl: 'modules/hercules/fusion-pages/resource-group-settings/assign-clusters.html',
        type: 'full',
        windowClass: 'assign-clusters-modal',
      }).result.then(function (result) {
        if (result.change) {
          Notification.success('hercules.resourceGroupSettings.assignSuccess');
        }
      });
    }

    function handleKeypress(event) {
      if (event.keyCode === 13) {
        setGroupName(vm.newGroupName);
      }
    }
  }
})();
