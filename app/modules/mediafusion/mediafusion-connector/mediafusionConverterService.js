(function () {
  'use strict';

  angular.module('Mediafusion')
    .service('MediafusionConverterService', MediafusionConverterService);

  function MediafusionConverterService() {

    var getAvailableSoftwareUpgradeForService = function (service, cluster) {
      if (cluster.provisioning_data && cluster.provisioning_data.not_approved_packages) {
        return _.find(cluster.provisioning_data.not_approved_packages, function (pkg) {
          return pkg.service.service_type == service.service_type;
        });
      }
    };

    var anyApprovedPackagesForService = function (service, cluster) {
      if (cluster.provisioning_data && cluster.provisioning_data.approved_packages) {
        return _.find(cluster.provisioning_data.approved_packages, function (pkg) {
          return pkg.service.service_type == service.service_type;
        });
      }
      return false;
    };

    var checkSoftwareUpgradePending = function (service, cluster) {
      if (cluster.provisioning_data && cluster.provisioning_data.approved_packages) {
        var expected_package = _.find(cluster.provisioning_data.approved_packages, function (pkg) {
          return pkg.service.service_type == service.service_type;
        });

        var expected_version = !expected_package ? null : expected_package.version;

        _.each(service.connectors, function (connector) {
          connector.software_upgrade_pending = connector.version != expected_version && expected_version;
        });
      }
    };

    var updateServiceStatus = function (service, cluster) {
      service.alarm_count = 0;
      cluster.alarms = [];

      service.running_hosts = _.reduce(service.connectors, function (num, con) {
        if (con.state == 'running') {
          return ++num;
        } else {
          return num;
        }
      }, 0);

      _.each(service.connectors, function (connector) {
        connector.alarms = sortBySeverity(connector.alarms);

        if (service.state && connector.state != service.state) {
          service.state = 'needs_attention';
        } else {
          service.state = connector.state;
        }

        service.alarm_count += connector.alarms ? connector.alarms.length : 0;
        //cluster.alarm_count =  service.alarm_count;

        if ((connector.alarms && connector.alarms.length) || (connector.state != 'running' && connector.state != 'disabled')) {
          serviceAndClusterNeedsAttention(service, cluster);
          service.status = 'needs_attention';
          connector.status = 'needs_attention';
        }

        if (connector.state == 'disabled' || connector.state == 'running') {
          if (connector.status && connector.status != connector.state) {
            connector.status = 'needs_attention';
          } else {
            connector.status = connector.state;
          }
          if (service.status && service.status != connector.state) {
            service.status = 'needs_attention';
          } else {
            service.status = connector.state;
          }
        }

        if (service.status != 'needs_attention') {
          cluster.needs_attention = false;
          service.needs_attention = false;
        }

        // update version
        cluster.version = connector.version;
        cluster.state = connector.state;

        // update alarm flag
        if (connector.alarms && connector.alarms.length > 0) {
          cluster.alarms_present = true;
          cluster.alarm_count = connector.alarms.length;
          cluster.alarms = cluster.alarms.concat(connector.alarms);
        } else {
          cluster.alarms_present = false;
          cluster.alarm_count = 0;
        }

      });
      if (service.running_hosts) {
        cluster.running_hosts = true;
      }
    };

    function serviceAndClusterNeedsAttention(service, cluster) {
      // cluster.needs_attention = true;
      service.needs_attention = true;
    }

    var updateSoftwareUpgradeAvailableDetails = function (service, cluster) {
      if (cluster.provisioning_data) {
        service.installed = service.connectors.length > 0;
        var not_approved_package = getAvailableSoftwareUpgradeForService(service, cluster);
        if (not_approved_package && service.installed) {
          service.software_upgrade_available = true;
          cluster.software_upgrade_available = true;
          service.not_approved_package = not_approved_package;
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
        .value();

      var map = _.reduce(connectors, function (map, connector) {
        var host = connector.host ? connector.host.serial : 'null';
        map[host] = map[host] || [];
        map[host].push(connector.state);
        return map;
      }, {});

      _.each(cluster.hosts, function (host) {
        host.alarms = [];
        host.services = [];
        host.offline = false;

        if (map[host.serial]) {
          host.offline = _.reduce(map[host.serial], function (offline, status) {
            return offline && status == 'offline';
          }, true);
        }
        _.each(cluster.services, function (service) {
          _.each(service.connectors, function (connector) {
            if (connector.host.serial == host.serial) {

              if ((host.state == 'running' && connector.state == 'disabled') || (host.state == 'disabled' && connector.state == 'running')) {
                host.state = 'running';
              } else if (host.state && connector.state != host.state) {
                host.state = 'needs_attention';
              } else {
                host.state = connector.state;
              }

              if (connector.status == 'needs_attention') {
                host.status = 'needs_attention';
              }

              if (connector.status == 'disabled') {
                host.status = host.status || connector.status;
              }

              if (connector.status == 'running') {
                if (host.status == 'disabled') {
                  host.status = 'running';
                } else {
                  host.status = host.status || connector.status;
                }
              }

              host.alarms = sortBySeverity(host.alarms.concat(connector.alarms));

              host.services.push({
                display_name: service.display_name,
                service_type: service.service_type,
                state: connector.state,
                status: connector.status,
                version: connector.version
              });
            }
          });
        });
      });
    };

    function sortBySeverity(alarms) {
      return _.sortBy(alarms, 'severity');
    }

    var convertClusters = function (data) {
      return _.chain(data)
        .filter(function (cluster) {
          return cluster.cluster_type == 'mf_mgmt';
        })
        .map(function (cluster) {
          _.each(cluster.services, function (service) {
            updateServiceStatus(service, cluster);
            updateSoftwareUpgradeAvailableDetails(service, cluster);
            checkSoftwareUpgradePending(service, cluster);
          });
          updateClusterNameIfNotSet(cluster);
          updateHostStatus(cluster);

          cluster.services = _.sortBy(cluster.services, 'display_name');
          cluster.services = _.sortBy(cluster.services, function (obj) {
            if (obj.status == 'needs_attention') return 1;
            if (obj.status == 'disabled') return 3;
            return 2;
          });

          return cluster;
        })
        .indexBy('id')
        .sortBy(function (obj) {
          return obj.needs_attention;
        })
        .value();
    };

    return {
      convertClusters: convertClusters
    };
  }
})();
