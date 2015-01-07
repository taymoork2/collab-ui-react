'use strict';

/* global _ */

angular.module('Hercules')
  .service('DashboardAggregator', [
    function DashboardAggregator() {

      var aggregateServices = function (services, clusters) {
        var hosts = 0;
        _.each(clusters, function (cluster) {
          hosts += cluster.hosts.length;
        });
        var aggregatedServices = _.cloneDeep(services);
        _.each(aggregatedServices, function (globalService) {
          globalService.activatedClusters = 0;
          globalService.activatedHosts = 0;
          globalService.needs_attention = false;
          globalService.software_upgrades_available = false;
          _.each(clusters, function (cluster) {
            _.each(cluster.services, function (serviceInCluster) {
              if (globalService.type == serviceInCluster.service_type) {
                if (serviceInCluster.needs_attention) {
                  globalService.needs_attention = true;
                }
                if (cluster.provisioning_data) {
                  _.each(cluster.provisioning_data.not_approved_packages, function (not_approved_package) {
                    if (not_approved_package.service.service_type == globalService.type) {
                      globalService.software_upgrades_available = true;
                    }
                  });
                }
                globalService.activatedClusters += 1;
                _.each(serviceInCluster.connectors, function (connector) {
                  if (connector.state != 'disabled') {
                    globalService.activatedHosts += 1;
                  }
                });
              }
            });
          });
        });
        return {
          activatedHosts: hosts,
          activatedClusters: clusters.length,
          aggregatedServices: aggregatedServices
        };
      };

      return {
        aggregateServices: aggregateServices
      };
    }
  ]);
