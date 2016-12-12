(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('ResourceGroupSettingsController', ResourceGroupSettingsController);

  /* @ngInject */
  function ResourceGroupSettingsController($stateParams, ResourceGroupService, Notification, $translate, $state, FusionClusterService, $modal) {
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
    vm.users = {
      title: 'hercules.resourceGroupSettings.usersHeader'
    };
    vm.resourceGroup = {
      title: 'hercules.resourceGroups.resourceGroupHeading'
    };
    vm.allowRemove = false;
    vm.setGroupName = setGroupName;
    vm.releaseChannelChanged = releaseChannelChanged;
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
          getAllowedReleaseChannels();
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

    function getAllowedReleaseChannels() {
      ResourceGroupService.getAllowedChannels()
        .then(function (channels) {
          _.forEach(['beta', 'latest'], function (restrictedChannel) {
            if (_.includes(channels, restrictedChannel)) {
              vm.releaseChannelOptions.push({
                label: $translate.instant('hercules.fusion.add-resource-group.release-channel.' + restrictedChannel),
                value: restrictedChannel
              });
            }
          });
          setSelectedReleaseChannelOption();
        })
        .catch(function (error) {
          Notification.errorWithTrackingId(error, 'hercules.genericFailure');
        });
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

    function setSelectedReleaseChannelOption() {
      vm.releaseChannelSelected = _.find(vm.releaseChannelOptions, function (option) {
        return option.value === vm.group.releaseChannel.toLowerCase();
      });
      if (!vm.releaseChannelSelected) {
        vm.showResetSection = true;
        vm.localizedCurrentChannelName = $translate.instant('hercules.fusion.add-resource-group.release-channel.' + vm.group.releaseChannel);
        vm.localizedStableChannelName = $translate.instant('hercules.fusion.add-resource-group.release-channel.stable');
      }
    }


    vm.resetReleaseChannel = function () {
      ResourceGroupService.setReleaseChannel(vm.group.id, 'stable')
        .then(function () {
          vm.releaseChannelSelected = vm.releaseChannelOptions[0];
          vm.showResetSection = false;
          vm.channelHasBeenReset = true;
          Notification.success('hercules.resourceGroupSettings.groupReleaseChannelSaved');
        })
        .catch(function (error) {
          Notification.errorWithTrackingId(error, 'hercules.genericFailure');
        });
    };

    function handleKeypress(event) {
      if (event.keyCode === 13) {
        setGroupName(vm.newGroupName);
      }
    }
  }
})();
