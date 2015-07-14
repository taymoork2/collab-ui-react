(function () {
  'use strict';
  angular
    .module('Hercules')
    .controller('ConfigureConnectorsController', function (ClusterService) {
      var configureConnectors = this;
      var clusters = ClusterService.getClusters();

      configureConnectors.showConfigureConnectors = function () {
        return _.some(clusters, function (cluster) {
          return cluster.cluster_type == 'c_mgmt' && (!cluster.any_service_connectors_enabled || cluster.any_service_connectors_not_configured);
        });
      };
    })
    .directive('herculesConfigureConnectors', [
      function () {
        return {
          restrict: 'E',
          controller: 'ConfigureConnectorsController',
          controllerAs: 'configureConnectors',
          templateUrl: 'modules/hercules/dashboard-info-panel/configure_connectors.html'
        };
      }
    ]);
})();
