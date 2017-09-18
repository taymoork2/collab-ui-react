(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('MediafusionClusterSettingsController', MediafusionClusterSettingsController);

  /* @ngInject */
  function MediafusionClusterSettingsController($stateParams, HybridServicesClusterService, Notification, MediaClusterServiceV2, hasMFFeatureToggle, hasMFSIPFeatureToggle) {
    var vm = this;
    vm.saveSipTrunk = saveSipTrunk;
    vm.saveTrustedSip = saveTrustedSip;
    vm.hasMFFeatureToggle = hasMFFeatureToggle;
    vm.hasMFSIPFeatureToggle = hasMFSIPFeatureToggle;
    //vm.sipurlconfiguration = '';
    vm.upgradeSchedule = {
      title: 'hercules.expresswayClusterSettings.upgradeScheduleHeader',
    };

    vm.sipRegistration = {
      title: 'mediaFusion.sipconfiguration.title',
    };

    vm.trustedSip = {
      title: 'mediaFusion.trustedSip.title',
    };

    MediaClusterServiceV2.getProperties($stateParams.id)
      .then(function (properties) {
        vm.sipurlconfiguration = properties['mf.ucSipTrunk'];
        vm.trustedsipconfiguration = properties['mf.trustedSipSources'];
        var sipArray = [];
        if (!_.isUndefined(vm.trustedsipconfiguration)) {
          _.forEach(vm.trustedsipconfiguration.split(','), function (value) {
            sipArray.push({ text: value });
          });
        }
        if (vm.trustedsipconfiguration !== '') {
          vm.trustedsipconfiguration = sipArray;
        } else {
          vm.trustedsipconfiguration = [];
        }
      });

    vm.deregisterModalOptions = {
      resolve: {
        cluster: function () {
          return vm.cluster;
        },
      },
      controller: 'DeleteClusterSettingControllerV2',
      controllerAs: 'deleteClust',
      templateUrl: 'modules/mediafusion/media-service-v2/delete-cluster/delete-cluster-dialog.html',
    };

    loadCluster($stateParams.id);

    function loadCluster(clusterid) {
      HybridServicesClusterService.getAll()
        .then(function (clusters) {
          var cluster = _.find(clusters, function (c) {
            return c.id === clusterid;
          });
          vm.cluster = cluster;
          vm.clusters = clusters;
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
        'mf.ucSipTrunk': vm.sipurlconfiguration,
      };
      MediaClusterServiceV2
        .setProperties($stateParams.id, vm.payLoad)
        .then(function () {
          Notification.success('mediaFusion.sipconfiguration.success');
        }, function (err) {
          Notification.errorWithTrackingId(err, 'hercules.genericFailure');
        });
    }

    function saveTrustedSip() {
      vm.payLoad = {
        'mf.trustedSipSources': _.map(vm.trustedsipconfiguration, 'text').join(', '),
      };
      MediaClusterServiceV2
        .setProperties($stateParams.id, vm.payLoad)
        .then(function () {
          Notification.success('mediaFusion.trustedSip.success');
        }, function (err) {
          Notification.errorWithTrackingId(err, 'hercules.genericFailure');
        });
    }
  }
})();
