(function () {
  'use strict';

  /* @ngInject */
  function MediaServiceSettingsControllerV2($stateParams, Analytics, FusionClusterService, MediaClusterServiceV2, Notification) {
    var vm = this;
    vm.config = "";
    vm.wx2users = "";
    vm.serviceType = "mf_mgmt";
    vm.serviceId = "squared-fusion-media";
    vm.cluster = $stateParams.cluster;
    vm.enableVideoQuality = false;
    vm.setEnableVideoQuality = setEnableVideoQuality;
    vm.clusterCount = 0;
    vm.successCount = 0;
    vm.errorCount = 0;
    vm.settingsValue = null;

    vm.emailSection = {
      title: 'common.general',
    };

    vm.videoQuality = {
      title: 'mediaFusion.videoQuality.title',
    };

    MediaClusterServiceV2.getV1Clusters()
      .then(function (clusters) {
        vm.clusters = _.filter(clusters, {
          cluster_type: 'mf_mgmt',
        });

        vm.trueVideoClusters = _.filter(vm.clusters,
          function (cluster) {
            return cluster.properties["mf.videoQuality"] === 'true';
          });

        vm.falseVideoClusters = _.filter(vm.clusters,
          function (cluster) {
            return cluster.properties["mf.videoQuality"] === 'false';
          });

        if (vm.trueVideoClusters.length > vm.falseVideoClusters) {
          vm.enableVideoQuality = true;
        } else {
          vm.enableVideoQuality = false;
        }

      });

    function setEnableVideoQuality() {
      //TODO: Setting the value for video quality in CI.
      //Setting the value for video quality in all clusters using Tag.
      vm.payLoad = {
        'mf.videoQuality': vm.enableVideoQuality,
      };
      FusionClusterService.getAll()
        .then(function (clusters) {
          vm.successCount = 0;
          vm.errorCount = 0;
          vm.clusters = _.filter(clusters, {
            targetType: 'mf_mgmt',
          });
          vm.clusterCount = vm.clusters.length;
          _.each(vm.clusters, function (cluster) {
            MediaClusterServiceV2
              .setProperties(cluster.id, vm.payLoad)
              .then(function () {
                vm.successCount++;
                notifyVideoQuality();
              }, function () {
                vm.errorCount++;
                notifyVideoQuality();
              });
          });
        });
    }

    function notifyVideoQuality() {
      if (vm.clusterCount === (vm.successCount + vm.errorCount)) {
        if (vm.clusterCount === vm.successCount) {
          Notification.success('mediaFusion.videoQuality.success');
        } else {
          Notification.errorWithTrackingId('mediaFusion.videoQuality.error');
        }
      }
    }

    vm.deactivateModalOptions = {
      templateUrl: 'modules/mediafusion/media-service-v2/settings/confirm-disable-dialog.html',
      controller: 'DisableMediaServiceController',
      controllerAs: 'disableServiceDialog',
      type: 'small',
    };

    Analytics.trackHSNavigation(Analytics.sections.HS_NAVIGATION.eventNames.VISIT_MEDIA_SETTINGS);
  }

  angular
    .module('Mediafusion')
    .controller('MediaServiceSettingsControllerV2', MediaServiceSettingsControllerV2);
}());
