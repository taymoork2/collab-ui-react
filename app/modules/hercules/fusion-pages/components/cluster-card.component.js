(function () {
  'use strict';

  angular.module('Hercules')
    .component('clusterCard', {
      bindings: {
        cluster: '<'
      },
      templateUrl: 'modules/hercules/fusion-pages/components/cluster-card.html',
      controller: ClusterCardController
    });

  /* @ngInject */
  function ClusterCardController($state, FusionClusterService) {
    var ctrl = this;

    ctrl.countHosts = countHosts;
    ctrl.getHostnames = getHostnames;
    ctrl.openService = openService;
    ctrl.openSettings = openSettings;
    ctrl.hasServices = hasServices;
    ctrl.formatTimeAndDate = FusionClusterService.formatTimeAndDate;

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
      return cluster.servicesStatuses.some(function (serviceStatus) {
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
        $state.go('media-service-v2.list');
      }
    }

    function openSettings(type, id) {
      if (type === 'c_mgmt') {
        $state.go('expressway-settings', {
          id: id
        });
      } else if (type === 'mf_mgmt') {
        $state.go('mediafusion-settings', {
          id: id
        });
      }
    }
  }

})();
