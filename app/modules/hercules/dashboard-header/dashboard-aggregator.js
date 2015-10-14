'use strict';

/* global _ */

angular.module('Hercules')
  .service('DashboardAggregator', [
    function DashboardAggregator() {

      var createEmptyAggregate = function (services) {
        return {
          running: 0,
          needs_attention: 0,
          services: createEmptyServicesAggregate(services)
        };
      };

      var serviceIdToConnectorType = function (serviceType) {
        switch (serviceType) {
        case "squared-fusion-cal":
          return "c_cal";
        case "squared-fusion-uc":
          return "c_ucmc";
        default:
          //console.error("serviceType " + serviceType + " not supported in this controller");
          return "";
        }
      };

      function createEmptyServicesAggregate(services) {
        return _.reduce(services, function (serviceAggregate, service) {
          if (service.enabled) {
            serviceAggregate[serviceIdToConnectorType(service.id)] = {
              id: service.id,
              running: 0,
              needs_attention: 0,
              software_upgrades: 0
            };
          }
          return serviceAggregate;
        }, {});
      }

      var aggregateServiceStatus = function (clusterAggregate, cluster) {
        _.each(cluster.services, function (clusterService) {
          if (clusterService.service_type != 'c_mgmt') {
            var allConnecorsDisabled = _.reduce(clusterService.connectors, function (aggregateStatus, connector) {
              return aggregateStatus && connector.state == 'disabled';
            }, true);
            if (!allConnecorsDisabled) {
              var aggregateService = clusterAggregate.services[clusterService.service_type];
              if (aggregateService) {
                if (clusterService.needs_attention) {
                  aggregateService.needs_attention++;
                } else {
                  aggregateService.running++;
                }
                if (clusterService.not_approved_package) {
                  aggregateService.software_upgrades++;
                }
              }
            }
          }
        });
        var allServicesDisabled = _.reduce(
          cluster.services,
          function (aggregateStatus, service) {
            return aggregateStatus && !service.running_hosts;
          },
          true
        );
        if (cluster.needs_attention) {
          clusterAggregate.needs_attention++;
        } else if (!allServicesDisabled) {
          clusterAggregate.running++;
        }
        return clusterAggregate;
      };

      return {
        aggregateServices: function (services, clusters) {
          return _.reduce(
            clusters,
            aggregateServiceStatus,
            createEmptyAggregate(services)
          );
        }
      };
    }
  ]);
