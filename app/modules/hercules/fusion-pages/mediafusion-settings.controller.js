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
      title: 'hercules.expresswayClusterSettings.upgradeScheduleHeader',
      description: 'hercules.expresswayClusterSettings.upgradeScheduleParagraph'
    };

    //hardcoded now and will be changed in the future 
    vm.options = [
      'GA',
      'DEV',
      'ALPHA'
    ];

    vm.selected = '';

    vm.changeReleaseChanel = function () {
      if (vm.selected != vm.cluster.releaseChannel) {
        MediaClusterServiceV2.updateV2Cluster(vm.cluster.id, vm.displayName, vm.selected);
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
          vm.selectPlaceholder = vm.cluster.releaseChannel;
          vm.localizedTitle = $translate.instant('hercules.expresswayClusterSettings.pageTitle', {
            clusterName: cluster.name
          });
        }, XhrNotificationService.notify);
    }
  }
})();
