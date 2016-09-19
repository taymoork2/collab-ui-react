(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('MediafusionClusterSettingsController', MediafusionClusterSettingsController);

  /* @ngInject */
  function MediafusionClusterSettingsController($stateParams, $translate, FusionClusterService, XhrNotificationService, MediaClusterServiceV2, $modal, FusionUtils, Notification, Orgservice, Config) {
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
    vm.isTest = false;
    vm.options = [];

    vm.getOrg = function () {
      Orgservice.getOrg(function (data) {
        if (data.success) {
          vm.isTest = data.isTestOrg;
        }
      });
    };

    vm.getOrg();

    //hardcoded now and will be changed in the future
    if (Config.getEnv() === 'prod' && !vm.isTest) {
      vm.options = [{
        value: 'stable',
        label: $translate.instant('hercules.fusion.add-resource-group.release-channel.stable')
      }, {
        value: 'beta',
        label: $translate.instant('hercules.fusion.add-resource-group.release-channel.beta')
      }];
    } else {
      vm.options = [{
        value: 'stable',
        label: $translate.instant('hercules.fusion.add-resource-group.release-channel.stable')
      }, {
        value: 'beta',
        label: $translate.instant('hercules.fusion.add-resource-group.release-channel.beta')
      }, {
        value: 'latest',
        label: $translate.instant('hercules.fusion.add-resource-group.release-channel.latest')
      }];
    }

    vm.selected = '';

    vm.changeReleaseChanel = function () {
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
          vm.selectPlaceholder = FusionUtils.getLocalizedReleaseChannel(vm.cluster.releaseChannel);
          vm.localizedTitle = $translate.instant('hercules.expresswayClusterSettings.pageTitle', {
            clusterName: cluster.name
          });
        }, XhrNotificationService.notify);
    }
  }
})();
