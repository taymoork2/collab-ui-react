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
        }
      };

      var createEmptyServicesAggregate = function (services) {
        return _.reduce(services, function (memo, service) {
          memo[service.type] = {
            name: service.name,
            icon: service.icon,
            running: 0,
            needs_attention: 0,
            software_upgrades: 0
          };
          return memo;
        }, {});
      };

      var aggregateServiceStatus = function (memo, cluster) {
        cluster.needs_attention ? memo.needs_attention++ : memo.running++;
        _.each(cluster.services, function (service) {
          service.needs_attention ? memo.services[service.service_type].needs_attention++ : memo.services[service.service_type].running++;
          service.not_approved_package ? memo.services[service.service_type].software_upgrades++ : null;
        });
        return memo;
      };

      return {
        aggregateServices: function (services, clusters) {
          return _.reduce(clusters, aggregateServiceStatus, createEmptyAggregate(services));
        }
      };
    }
  ]);
