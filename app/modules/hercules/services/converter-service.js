'use strict';

angular.module('Hercules')
  .service('ConverterService', [
    function ConverterService() {

      var convertConnectors = function (data) {
        return _.map(data, function (connector) {
          var c = _.cloneDeep(connector);

          c.status = c.status || {};
          c.status.state = c.status.state || 'unknown';

          if (c.status.alarms && c.status.alarms.length) {
            c.status.state = 'error';
          }

          switch (c.status.state) {
          case 'running':
            c.status_class = 'success';
            break;
          case 'disabled':
          case 'not_configured':
            c.status_class = 'default';
            break;
          default:
            c.status_class = 'danger';
          }
          return c;
        });
      };

      var updateNotApprovedPackageForService = function (service, cluster) {
        if (service.is_disabled) {
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

      var serviceAndClusterNeedsAttention = function(service, cluster) {
        cluster.needs_attention = cluster.initially_open = true;
        service.needs_attention = true;
      };

      var convertClusters = function (data) {
        var converted = _.map(data, function (origCluster) {
          var cluster = _.cloneDeep(origCluster);
          _.each(cluster.services, function (service) {
            updateServiceStatus(service, cluster);
            updateNotApprovedPackageForService(service, cluster);
            deduceAlarmsForService(service, cluster);
          });
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
        convertClusters: convertClusters,
        convertConnectors: convertConnectors
      };
    }
  ]);
