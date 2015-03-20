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

      var createEmptyServicesAggregate = function (services) {
        return _.reduce(services, function (serviceAggregate, service) {
          if (service.type != 'c_mgmt') {
            serviceAggregate[service.type] = {
              name: service.name,
              icon: service.icon,
              running: 0,
              needs_attention: 0,
              software_upgrades: 0
            };
          }
          return serviceAggregate;
        }, {});
      };

      var aggregateServiceStatus = function (clusterAggregate, cluster) {
        _.each(cluster.services, function (service) {
          if (service.service_type != 'c_mgmt') {
            var allConnecorsDisabled = _.reduce(service.connectors, function (aggregateStatus, connector) {
              return aggregateStatus && connector.state == 'disabled';
            }, true);
            if (!allConnecorsDisabled) {
              if (service.needs_attention) {
                clusterAggregate.services[service.service_type].needs_attention++;
              } else {
                clusterAggregate.services[service.service_type].running++;
              }
              if (service.not_approved_package) {
                clusterAggregate.services[service.service_type].software_upgrades++;
              }
            }
          }
        });
        var allServicesDisabled = _.reduce(cluster.services, function (aggregateStatus, service) {
          return aggregateStatus && !service.running_hosts;
        }, true);
        if (cluster.needs_attention) {
          clusterAggregate.needs_attention++;
        } else if (!allServicesDisabled) {
          clusterAggregate.running++;
        }
        return clusterAggregate;
      };

      return {
        aggregateServices: function (services, clusters) {
          return _.reduce(clusters, aggregateServiceStatus, createEmptyAggregate(services));
        }
      };
    }
  ]);
