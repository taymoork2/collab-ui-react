(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('MediafusionClusterSettingsController', MediafusionClusterSettingsController);

  /* @ngInject */
  function MediafusionClusterSettingsController($stateParams, $translate, FusionClusterService, XhrNotificationService, MediaClusterServiceV2, $modal, FusionUtils, Notification, ResourceGroupService) {
    var vm = this;
    vm.backUrl = 'cluster-list';
    vm.upgradeSchedule = {
      title: 'hercules.expresswayClusterSettings.upgradeScheduleHeader'
    };
    vm.releaseChannel = {
      title: 'mediaFusion.clusters.releaseChannel',
      description: 'mediaFusion.clusters.releaseChannelDesc'
    };
    vm.delete = {
      title: 'mediaFusion.clusters.deletecluster',
      description: 'mediaFusion.clusters.deleteclusterDesc'
    };

    vm.releaseChannelOptions = [{
      label: $translate.instant('hercules.fusion.add-resource-group.release-channel.stable'),
      value: 'stable'
    }];

    vm.populateChannels = function () {
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
        }, XhrNotificationService.notify);
    };
    vm.populateChannels();

    vm.selected = '';

    vm.changeReleaseChannel = function () {
      if (vm.selected.label != vm.cluster.releaseChannel) {
        MediaClusterServiceV2.updateV2Cluster(vm.cluster.id, vm.displayName, vm.selected.value)
          .then(function () {
            Notification.success('hercules.fusion.add-resource-group.release-channel.saveReleaseChannelSuccess');
          }, function () {
            Notification.error('hercules.fusion.add-resource-group.release-channel.saveReleaseChannelError');
          });
      }
    };

    vm.deleteCluster = function () {
      $modal.open({
        resolve: {
          cluster: function () {
            return vm.cluster;
          }
        },
        controller: 'DeleteClusterSettingControllerV2',
        controllerAs: "deleteClust",
        templateUrl: 'modules/mediafusion/media-service-v2/delete-cluster/delete-cluster-dialog.html'
      });
    };

    loadCluster($stateParams.id);

    function loadCluster(clusterid) {
      FusionClusterService.getAll()
        .then(function (clusters) {
          var cluster = _.find(clusters, function (c) {
            return c.id === clusterid;
          });
          vm.cluster = cluster;
          vm.clusters = clusters;
          if (vm.cluster) {
            vm.selectPlaceholder = FusionUtils.getLocalizedReleaseChannel(vm.cluster.releaseChannel);
            vm.localizedTitle = $translate.instant('hercules.expresswayClusterSettings.pageTitle', {
              clusterName: cluster.name
            });
          }
        }, XhrNotificationService.notify);
    }
  }
})();
