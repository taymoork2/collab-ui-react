(function () {
  'use strict';

  angular.module('Hercules')
    .component('clusterCard', {
      bindings: {
        cluster: '<',
      },
      templateUrl: 'modules/hercules/fusion-pages/components/cluster-card.html',
      controller: ClusterCardController,
    });

  /* @ngInject */
  function ClusterCardController($state, FusionClusterService, FeatureToggleService, FusionUtils, $window, $modal) {
    var ctrl = this;

    ctrl.countHosts = countHosts;
    ctrl.getHostnames = getHostnames;
    ctrl.openNodes = openNodes;
    ctrl.openService = openService;
    ctrl.openSettings = openSettings;
    ctrl.hasServices = hasServices;
    ctrl.goToExpressway = goToExpressway;
    ctrl.openDeleteConfirm = openDeleteConfirm;
    ctrl.formatTimeAndDate = FusionClusterService.formatTimeAndDate;
    ctrl.hasResourceGroupFeatureToggle = false;
    ctrl.hasNodesViewFeatureToggle = false;
    ctrl.getLocalizedReleaseChannel = FusionUtils.getLocalizedReleaseChannel;
    ctrl.hybridServicesComparator = FusionUtils.hybridServicesComparator;

    FeatureToggleService.supports(FeatureToggleService.features.atlasF237ResourceGroup)
      .then(function (supported) {
        ctrl.hasResourceGroupFeatureToggle = supported;
      });
    FeatureToggleService.supports(FeatureToggleService.features.atlasHybridNodesView)
      .then(function (supported) {
        ctrl.hasNodesViewFeatureToggle = supported;
      });

    function getHostnames(cluster) {
      return _.chain(cluster.connectors)
        .map('hostname')
        .uniq()
        .sort()
        .map(_.escape)
        .join('<br />')
        .value();
    }

    function countHosts(cluster) {
      return _.chain(cluster.connectors)
        .map('hostname')
        .uniq()
        .size()
        .value();
    }

    function hasServices(cluster) {
      return _.some(cluster.servicesStatuses, function (serviceStatus) {
        return serviceStatus.serviceId !== 'squared-fusion-mgmt' && serviceStatus.total > 0;
      });
    }

    function openService(serviceId, clusterId) {
      if (serviceId === 'squared-fusion-uc') {
        $state.go('call-service.list', {
          'clusterId': clusterId
        });
      } else if (serviceId === 'squared-fusion-cal') {
        $state.go('calendar-service.list', {
          'clusterId': clusterId
        });
      } else if (serviceId === 'squared-fusion-media') {
        $state.go('media-service-v2.list', {
          'clusterId': clusterId,
        });
      } else if (serviceId === 'spark-hybrid-datasecurity') {
        $state.go('hds.list', {
          'clusterId': clusterId,
        });
      }
    }

    function openNodes(type, id) {
      if (type === 'c_mgmt') {
        $state.go('expressway-cluster.nodes', {
          id: id
        });
      } else if (type === 'mf_mgmt') {
        $state.go('mediafusion-cluster.nodes', {
          id: id
        });
      } else if (type === 'hds_app') {
        $state.go('hds-cluster.nodes', {
          id: id
        });
      }
    }

    function openSettings(type, id) {
      if (type === 'c_mgmt') {
        $state.go('expressway-cluster.settings', {
          id: id
        });
      } else if (type === 'mf_mgmt') {
        $state.go('mediafusion-cluster.settings', {
          id: id
        });
      } else if (type === 'hds_app') {
        $state.go('hds-cluster.settings', {
          id: id
        });
      }
    }

    function openDeleteConfirm(cluster) {
      $modal.open({
        resolve: {
          cluster: function () {
            return cluster;
          }
        },
        controller: 'ClusterDeregisterController',
        controllerAs: 'clusterDeregister',
        templateUrl: 'modules/hercules/fusion-pages/components/rename-and-deregister-cluster-section/deregister-dialog.html',
        type: 'dialog'
      }).result.then(function () {
        $state.go('cluster-list', {}, { reload: true });
      });
    }

    function goToExpressway(hostname) {
      $window.open('https://' + encodeURIComponent(hostname) + '/fusionregistration');

    }
  }
})();
