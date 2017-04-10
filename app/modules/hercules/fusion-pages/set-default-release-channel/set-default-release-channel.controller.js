(function () {
  'use strict';

  angular.module('Hercules')
    .controller('SetDefaultReleaseChannelController', SetDefaultReleaseChannelController);

  /* @ngInject */
  function SetDefaultReleaseChannelController($q, $modalInstance, $translate, unassignedClusters, FusionClusterService, Notification, ResourceGroupService) {
    var vm = this;
    var restrictedChannels = ['beta', 'latest'];
    var saving = false;
    vm.isDisabled = isDisabled;
    vm.saveReleaseChannel = saveReleaseChannel;
    vm.releaseChannelSelected = undefined;
    vm.releaseChannelOptions = [{
      label: $translate.instant('hercules.fusion.add-resource-group.release-channel.stable'),
      value: 'stable',
    }];

    populateReleaseChannelOptions()
      .then(getDefaultReleaseChannel);

    function isDisabled() {
      return saving || vm.releaseChannelSelected === undefined;
    }

    function saveReleaseChannel(channel) {
      saving = true;
      return FusionClusterService.setOrgSettings({
        expresswayClusterReleaseChannel: channel,
      })
      .then(_.partial(updateAllUnassignedClusters, channel))
      .catch(function (error) {
        Notification.errorWithTrackingId(error, 'hercules.fusion.defaultReleaseChannelModal.error');
        return $q.reject(error);
      })
      .then($modalInstance.close)
      .finally(function () {
        saving = false;
      });
    }

    function updateAllUnassignedClusters(channel) {
      var promises = _.map(unassignedClusters, function (cluster) {
        return FusionClusterService.setReleaseChannel(cluster.id, channel);
      });
      return $q.all(promises);
    }

    function getDefaultReleaseChannel() {
      return FusionClusterService.getOrgSettings()
        .then(function (data) {
          vm.releaseChannelSelected = _.find(vm.releaseChannelOptions, {
            value: data.expresswayClusterReleaseChannel.toLowerCase(),
          });
        })
        .catch(function (error) {
          Notification.errorWithTrackingId(error, 'hercules.fusion.defaultReleaseChannelModal.error');
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
