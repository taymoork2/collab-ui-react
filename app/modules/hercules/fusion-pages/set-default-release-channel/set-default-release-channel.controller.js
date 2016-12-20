(function () {
  'use strict';

  angular.module('Hercules')
    .controller('SetDefaultReleaseChannelController', SetDefaultReleaseChannelController);

  /* @ngInject */
  function SetDefaultReleaseChannelController($translate, $modalInstance, FusionClusterService, Notification, ResourceGroupService) {
    var vm = this;
    var restrictedChannels = ['beta', 'latest'];
    vm.saving = false;
    vm.isDisabled = isDisabled;
    vm.save = save;
    vm.releaseChannelSelected = undefined;
    vm.releaseChannelOptions = [{
      label: $translate.instant('hercules.fusion.add-resource-group.release-channel.stable'),
      value: 'stable',
    }];

    populateReleaseChannelOptions()
      .then(getDefaultReleaseChannel);

    function isDisabled() {
      return vm.saving || vm.releaseChannelSelected === undefined;
    }

    function save() {
      vm.saving = true;
      return FusionClusterService.setOrgSettings({
        expresswayClusterReleaseChannel: vm.releaseChannelSelected.value,
      })
      .then(function () {
        $modalInstance.close();
      })
      .catch(function (error) {
        Notification.errorWithTrackingId(error, 'default release channel not saved');
      })
      .finally(function () {
        vm.saving = false;
      });
    }

    function getDefaultReleaseChannel() {
      return FusionClusterService.getOrgSettings()
        .then(function (data) {
          vm.releaseChannelSelected = _.find(vm.releaseChannelOptions, {
            value: data.expresswayClusterReleaseChannel.toLowerCase(),
          });
        })
        .catch(function (error) {
          Notification.errorWithTrackingId(error, 'default release channel not found');
        });
    }

    function populateReleaseChannelOptions() {
      return ResourceGroupService.getAllowedChannels()
        .then(function (channels) {
          _.forEach(restrictedChannels, function (restrictedChannel) {
            if (_.includes(channels, restrictedChannel)) {
              vm.releaseChannelOptions.push({
                label: $translate.instant('hercules.fusion.add-resource-group.release-channel.' + restrictedChannel),
                value: restrictedChannel,
              });
            }
          });
        })
        .catch(function (error) {
          Notification.errorWithTrackingId(error, 'hercules.genericFailure');
        });
    }
  }
})();
