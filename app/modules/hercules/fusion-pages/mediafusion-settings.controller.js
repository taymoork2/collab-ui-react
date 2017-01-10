(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('MediafusionClusterSettingsController', MediafusionClusterSettingsController);

  /* @ngInject */
  function MediafusionClusterSettingsController($stateParams, $translate, FusionClusterService, Notification, MediaClusterServiceV2, hasMFFeatureToggle) {
    var vm = this;
    vm.backUrl = 'cluster-list';
    vm.saveSipTrunk = saveSipTrunk;
    vm.hasMFFeatureToggle = hasMFFeatureToggle;
    //vm.sipurlconfiguration = '';
    vm.upgradeSchedule = {
      title: 'hercules.expresswayClusterSettings.upgradeScheduleHeader'
    };

    vm.sipRegistration = {
      title: 'mediaFusion.sipconfiguration.title'
    };

    MediaClusterServiceV2.getProperties($stateParams.id)
      .then(function (properties) {
        vm.sipurlconfiguration = properties['mf.ucSipTrunk'];
      });

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

    function saveSipTrunk() {
      vm.payLoad = {
        'mf.ucSipTrunk': vm.sipurlconfiguration
      };
      MediaClusterServiceV2
        .setProperties($stateParams.id, vm.payLoad)
          .then(function () {
            Notification.success('mediaFusion.sipconfiguration.success');
          }, function (err) {
            Notification.errorWithTrackingId(err, 'hercules.genericFailure');
          });
    }

    /* Callback function used by <rename-and-deregister-cluster-section>  */
    vm.nameUpdated = function () {
      loadCluster($stateParams.id);
    };


  }
})();
