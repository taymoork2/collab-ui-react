(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('ResourceGroupSettingsController', ResourceGroupSettingsController);

  var KeyCodes = require('modules/core/accessibility').KeyCodes;

  /* @ngInject */
  function ResourceGroupSettingsController($stateParams, ResourceGroupService, Notification, $state, HybridServicesClusterService, $modal) {
    var vm = this;
    vm.backState = 'cluster-list';
    vm.clusters = {
      title: 'hercules.resourceGroupSettings.clustersHeader',
    };
    vm.users = {
      title: 'hercules.resourceGroupSettings.usersHeader',
    };
    vm.resourceGroup = {
      title: 'hercules.resourceGroups.resourceGroupHeading',
    };
    vm.userDocumentation = 'https://collaborationhelp.cisco.com/article/en-us/DOC-16382';
    vm.allowRemove = false;
    vm.showResetSection = false;
    vm.setGroupName = setGroupName;
    vm.openDeleteGroupModal = openDeleteGroupModal;
    vm.openAssignClustersModal = openAssignClustersModal;
    vm.handleKeypress = handleKeypress;
    vm.manageUsers = manageUsers;

    loadResourceGroup($stateParams.id);
    determineIfRemoveAllowed();

    function loadResourceGroup(resourceGroupId) {
      ResourceGroupService.get(resourceGroupId)
        .then(function (group) {
          vm.group = group;
          vm.newGroupName = group.name;
          vm.title = 'hercules.resourceGroupSettings.pageTitle';
          vm.titleValues = {
            groupName: group.name,
          };
        })
        .catch(function (error) {
          Notification.errorWithTrackingId(error, 'hercules.resourceGroupSettings.loadFailed');
        });
    }

    function determineIfRemoveAllowed() {
      HybridServicesClusterService.getAll()
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
          vm.titleValues = {
            groupName: newName,
          };
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
          },
        },
        controller: 'ConfirmDeleteResourceGroupController',
        controllerAs: 'vm',
        template: require('modules/hercules/fusion-pages/resource-group-settings/confirm-delete-resource-group.html'),
        type: 'dialog',
      }).result.then(function () {
        $state.go('cluster-list');
      });
    }

    function openAssignClustersModal() {
      $modal.open({
        resolve: {
          resourceGroup: function () {
            return vm.group;
          },
        },
        controller: 'AssignClustersController',
        controllerAs: 'vm',
        template: require('modules/hercules/fusion-pages/resource-group-settings/assign-clusters.html'),
        type: 'full',
        windowClass: 'assign-clusters-modal',
      }).result.then(function (result) {
        determineIfRemoveAllowed();
        if (result.change) {
          Notification.success('hercules.resourceGroupSettings.assignSuccess');
        }
      });
    }

    function handleKeypress(event) {
      if (event.keyCode === KeyCodes.ENTER) {
        setGroupName(vm.newGroupName);
      }
    }

    function manageUsers() {
      $state.go('users.list').then(function () {
        $state.go('users.manage.picker');
      });
    }
  }
})();
