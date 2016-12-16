(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('MediafusionClusterSettingsController', MediafusionClusterSettingsController);

  /* @ngInject */
  function MediafusionClusterSettingsController($stateParams, $translate, FusionClusterService, MediaClusterServiceV2, FusionUtils, Notification, ResourceGroupService, hasEmergencyUpgradeFeatureToggle) {
    var vm = this;
    vm.backUrl = 'cluster-list';
    vm.showEmergencyUpgrade = hasEmergencyUpgradeFeatureToggle;
    vm.upgradeSchedule = {
      title: 'hercules.expresswayClusterSettings.upgradeScheduleHeader'
    };
    vm.releaseChannel = {
      title: 'mediaFusion.clusters.releaseChannel',
    };

    vm.releaseChannelOptions = [{
      label: $translate.instant('hercules.fusion.add-resource-group.release-channel.stable'),
      value: 'stable'
    }];

    vm.deregisterModalOptions = {
      resolve: {
        cluster: function () {
          return vm.cluster;
        }
      },
      controller: 'DeleteClusterSettingControllerV2',
      controllerAs: 'deleteClust',
      templateUrl: 'modules/mediafusion/media-service-v2/delete-cluster/delete-cluster-dialog.html'
    };

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
        })
        .catch(function (error) {
          Notification.errorWithTrackingId(error, 'hercules.genericFailure');
        });
    };
    vm.populateChannels();

    vm.selected = '';

    vm.changeReleaseChannel = function () {
      if (vm.selected.label != vm.cluster.releaseChannel) {
        MediaClusterServiceV2.updateV2Cluster(vm.cluster.id, vm.displayName, vm.selected.value)
          .then(function () {
            Notification.success('hercules.fusion.add-resource-group.release-channel.saveReleaseChannelSuccess');
          })
          .catch(function (error) {
            Notification.errorWithTrackingId(error, 'hercules.fusion.add-resource-group.release-channel.saveReleaseChannelError');
          });
      }
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
          if (cluster && cluster.connectors && cluster.connectors.length === 0) {
            /* We have cluster data, but there are no nodes. Let's use the default deregistration dialog.  */
            vm.deregisterModalOptions = undefined;
          }
        })
        .catch(function (error) {
          Notification.errorWithTrackingId(error, 'hercules.genericFailure');
        });
    }

    /* Callback function used by <rename-and-deregister-cluster-section>  */
    vm.nameUpdated = function () {
      loadCluster($stateParams.id);
    };


  }
})();
