(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('MediafusionClusterSettingsController', MediafusionClusterSettingsController);

  /* @ngInject */
  function MediafusionClusterSettingsController($stateParams, $translate, FusionClusterService, XhrNotificationService, MediaClusterServiceV2, $modal) {
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
      title: 'mediaFusion.clusters.deleteclusterDesc'
    };

    //hardcoded now and will be changed in the future
    vm.options = [{
      value: 0,
      label: $translate.instant('mediaFusion.clusters.stable')
    }, {
      value: 1,
      label: $translate.instant('mediaFusion.clusters.beta')
    }, {
      value: 2,
      label: $translate.instant('mediaFusion.clusters.latest')
    }];

    vm.selected = '';

    vm.changeReleaseChanel = function () {
      if (vm.selected.label != vm.cluster.releaseChannel.toLocaleUpperCase()) {
        MediaClusterServiceV2.updateV2Cluster(vm.cluster.id, vm.displayName, vm.selected.label.toLocaleLowerCase());
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
          vm.selectPlaceholder = vm.cluster.releaseChannel.toLocaleUpperCase();
          vm.localizedTitle = $translate.instant('hercules.expresswayClusterSettings.pageTitle', {
            clusterName: cluster.name
          });
        }, XhrNotificationService.notify);
    }
  }
})();
