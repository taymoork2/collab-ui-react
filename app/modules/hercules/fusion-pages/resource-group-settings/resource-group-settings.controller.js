(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('ResourceGroupSettingsController', ResourceGroupSettingsController);

  /* @ngInject */
  function ResourceGroupSettingsController($stateParams, ResourceGroupService, XhrNotificationService, Notification, $translate, $state, FusionClusterService, $modal) {
    var vm = this;
    vm.backUrl = 'cluster-list';
    vm.releaseChannel = {
      title: 'hercules.resourceGroupSettings.releaseChannelHeader'
    };
    vm.releaseChannelOptions = [{
      label: $translate.instant('hercules.fusion.add-resource-group.release-channel.stable'),
      value: 'stable'
    }];
    vm.clusters = {
      title: 'hercules.resourceGroupSettings.clustersHeader'
    };
    vm.resourceGroup = {
      title: 'hercules.resourceGroups.resourceGroupHeading'
    };
    vm.allowRemove = false;
    vm.setGroupName = setGroupName;
    vm.releaseChannelChanged = releaseChannelChanged;
    vm.deleteGroup = deleteGroup;
    vm.openAssignClustersModal = openAssignClustersModal;
    vm.handleKeypress = handleKeypress;

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
          getAllowedReleaseChannels();
        }, function () {
          Notification.error('hercules.resourceGroupSettings.loadFailed');
        });
    }

    function determineIfRemoveAllowed() {
      FusionClusterService.getAll()
        .then(function (clusters) {
          vm.allowRemove = !_.any(clusters, function (c) {
            return c.resourceGroupId === $stateParams.id;
          });
        }, angular.noop);
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
            Notification.error('hercules.resourceGroupSettings.duplicateName');
          } else {
            Notification.error('hercules.genericFailure');
          }
        });
    }

    function getAllowedReleaseChannels() {
      ResourceGroupService.getAllowedChannels()
        .then(function (channels) {
          _.forEach(['beta', 'latest'], function (restrictedChannel) {
            if (_.contains(channels, restrictedChannel)) {
              vm.releaseChannelOptions.push({
                label: $translate.instant('hercules.fusion.add-resource-group.release-channel.' + restrictedChannel),
                value: restrictedChannel
              });
            }
            setSelectedReleaseChannelOption();
          });
        }, XhrNotificationService.notify);
    }

    function releaseChannelChanged() {
      $modal.open({
        resolve: {
          resourceGroup: function () {
            return vm.group;
          },
          releaseChannel: function () {
            return vm.releaseChannelSelected.value;
          }
        },
        controller: 'ConfirmChangeReleaseChannelController',
        controllerAs: 'vm',
        templateUrl: 'modules/hercules/fusion-pages/resource-group-settings/confirm-change-release-channel.html',
        type: 'dialog'
      }).result.then(function () {
        vm.group.releaseChannel = vm.releaseChannelSelected.value;
      }, function () {
        setSelectedReleaseChannelOption();
      });
    }

    function deleteGroup() {
      ResourceGroupService.remove(vm.group.id)
        .then(function () {
          Notification.success('hercules.resourceGroupSettings.deleteSuccess');
          $state.go('cluster-list');
        }, function () {
          Notification.error('hercules.genericFailure');
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
        type: 'small'
      });
    }

    function setSelectedReleaseChannelOption() {
      vm.releaseChannelSelected = _.find(vm.releaseChannelOptions, function (option) {
        return option.value === vm.group.releaseChannel.toLowerCase();
      });
    }

    function handleKeypress(event) {
      if (event.keyCode === 13) {
        setGroupName(vm.newGroupName);
      }
    }
  }
})();
