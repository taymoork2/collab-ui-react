'use strict';

angular.module('Hercules')
  .service('ConverterService', [
    function ConverterService() {

      var allConnectorsOffline = function (service) {
        return _.reduce(service.connectors, function (offline, connector) {
          return offline && connector.state == 'offline';
        }, true);
      }

      var updateNotApprovedPackageForService = function (service, cluster) {
        if (service.is_disabled || allConnectorsOffline(service)) {
          return;
        }
        if (cluster.provisioning_data && cluster.provisioning_data.not_approved_packages) {
          var not_approved_package = _.find(cluster.provisioning_data.not_approved_packages, function (pkg) {
            return pkg.service.service_type == service.service_type;
          });
          if (not_approved_package) {
            service.not_approved_package = not_approved_package;
          }
        }
      };

      var deduceAlarmsForService = function (service, cluster) {
        if (cluster.provisioning_data && cluster.provisioning_data.approved_packages) {
          var expected_package = _.find(cluster.provisioning_data.approved_packages, function (pkg) {
            return pkg.service.service_type == service.service_type;
          });
          var expected_version = (expected_package == null) ? null : expected_package.version;

          _.each(service.connectors, function (connector) {
            connector.deduced_alarms = connector.deduced_alarms || [];
            if (expected_version && connector.state == 'running' && connector.version != expected_version) {
              connector.deduced_alarms.push({
                type: 'software_version_mismatch',
                expected_version: expected_version
              });
              serviceAndClusterNeedsAttention(service, cluster);
            }
          });
        }
      };

      var updateServiceStatus = function (service, cluster) {
        service.running_hosts = 0;
        _.each(service.connectors, function (connector) {
          if ((connector.alarms && connector.alarms.length) || (connector.state != 'running' && connector.state != 'disabled')) {
            serviceAndClusterNeedsAttention(service, cluster);
            service.is_disabled = false;
          }
          if (connector.state == 'disabled' && service.running_hosts == 0) {
            service.is_disabled = true;
          }
          if (connector.state == 'running') {
            service.is_disabled = false;
            service.running_hosts = ++service.running_hosts;
          }
        });
      };

      var serviceAndClusterNeedsAttention = function (service, cluster) {
        cluster.needs_attention = cluster.initially_open = true;
        service.needs_attention = true;
      };

      var stripAvailablePackagesIfServicesDisabledOrOffline = function (cluster) {
        if (cluster.provisioning_data) {
          var servicesDisabledOrOffline = _.reduce(cluster.services, function (disabledOrOffline, service) {
            return disabledOrOffline && (service.is_disabled || allConnectorsOffline(service));
          }, true);
          if (servicesDisabledOrOffline) {
            delete cluster.provisioning_data.not_approved_packages;
          }
        }
      };

      var updateClusterNameIfNotSet = function (cluster) {
        if (!cluster.name) {
          var host = _.find(cluster.hosts, function (host) {
            if (host.host_name) {
              return host.host_name;
            }
          });
          if (host) {
            cluster.name = host.host_name;
          }
        }
      };

      var updateHostStatus = function (cluster) {
        var connectors = _(cluster.services)
          .map(function (service) {
            return service.connectors;
          })
          .flatten()
          .value()

        var map = _.reduce(connectors, function (map, connector) {
          var host = connector.host ? connector.host.host_name : 'null';
          map[host] = map[host] || [];
          map[host].push(connector.state);
          return map;
        }, {});

        _.each(cluster.hosts, function (host) {
          host.offline = false;
          if (map[host.host_name]) {
            host.offline = _.reduce(map[host.host_name], function (offline, status) {
              return offline && status == 'offline';
            }, true);
          }
        });
      };

      var convertClusters = function (data) {
        var converted = _.map(data, function (origCluster) {
          var cluster = _.cloneDeep(origCluster);
          _.each(cluster.services, function (service) {
            updateServiceStatus(service, cluster);
            updateNotApprovedPackageForService(service, cluster);
            deduceAlarmsForService(service, cluster);
          });
          stripAvailablePackagesIfServicesDisabledOrOffline(cluster);
          updateClusterNameIfNotSet(cluster);
          updateHostStatus(cluster);
          cluster.services = _.sortBy(cluster.services, function (obj) {
            if (obj.needs_attention) return 1;
            if (obj.is_disabled) return 3;
            return 2;
          });
          return cluster;
        });
        return _.sortBy(converted, function (obj) {
          return !obj.needs_attention;
        });
      };

      return {
        convertClusters: convertClusters
      };
    }
  ]);
