(function () {
  'use strict';

  function Cluster(cluster) {

    angular.copy(cluster, this);

    this.services = getServices(cluster);
    this.name = this.name || getName(cluster);
    this.hosts = getHosts(cluster);

    this.running_hosts = _.reduce(this.services, function (sum, num) {
      return sum + num;
    }, 0);

    this.needs_attention = !!_.find(this.services, {
      needs_attention: true
    });

    this.software_upgrade_available = !!_.find(this.services, {
      software_upgrade_available: true
    });

    this.any_service_connectors_enabled = _.chain(cluster.services)
      .filter(function (service) {
        return service.service_type != 'c_mgmt';
      })
      .pluck('connectors')
      .flatten()
      .find(function (connector) {
        return connector.state != 'disabled';
      })
      .value();

    this.any_service_connectors_not_configured = _.chain(cluster.services)
      .filter(function (service) {
        return service.service_type != 'c_mgmt';
      })
      .pluck('connectors')
      .flatten()
      .find(function (connector) {
        return connector.state == 'not_configured';
      })
      .value();

    function sortBySeverity(alarms) {
      return _.sortBy(alarms, 'severity');
    }

    function getServices(cluster) {
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

      var updateSoftwareUpgradeAvailableDetails = function (service, cluster) {
        function getAvailableSoftwareUpgradeForService(service, cluster) {
          if (cluster.provisioning_data && cluster.provisioning_data.not_approved_packages) {
            return _.find(cluster.provisioning_data.not_approved_packages, function (pkg) {
              return pkg.service.service_type == service.service_type;
            });
          }
        }
        if (cluster.provisioning_data) {
          service.installed = service.connectors.length > 0;
          var not_approved_package = getAvailableSoftwareUpgradeForService(service, cluster);
          if (not_approved_package && service.installed) {
            service.software_upgrade_available = true;
            service.not_approved_package = not_approved_package;
          }
        }
      };

      var updateServiceStatus = function (service, cluster) {
        service.alarm_count = 0;

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

          if ((connector.alarms && connector.alarms.length) || (connector.state != 'running' && connector.state != 'disabled')) {
            service.needs_attention = true;
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

        });

      };

      _.each(cluster.services, function (service) {
        updateServiceStatus(service, cluster);
        updateSoftwareUpgradeAvailableDetails(service, cluster);
        checkSoftwareUpgradePending(service, cluster);
      });

      cluster.services = _.sortBy(cluster.services, 'display_name');
      cluster.services = _.sortBy(cluster.services, function (obj) {
        if (obj.status == 'needs_attention') return 1;
        if (obj.status == 'disabled') return 3;
        return 2;
      });

      return cluster.services;
    }

    function getName(cluster) {
      return _.chain(cluster.hosts)
        .pluck('host_name')
        .compact()
        .first()
        .value();
    }

    function getHosts(cluster) {
      var connectors = _(cluster.services)
        .map(function (service) {
          return service.connectors;
        })
        .flatten()
        .value();

      var hostToConnectorState = _.reduce(connectors, function (map, connector) {
        var host = connector.host ? connector.host.serial : 'null';
        map[host] = map[host] || [];
        map[host].push(connector.state);
        return map;
      }, {});

      _.each(cluster.hosts, function (host) {
        host.alarms = [];
        host.services = [];
        host.offline = false;

        if (hostToConnectorState[host.serial]) {
          host.offline = _.reduce(hostToConnectorState[host.serial], function (offline, status) {
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
      return cluster.hosts;
    }
  }

  function ConverterService() {

    var convertClusters = function (data) {
      return _.chain(data)
        .map(function (cluster) {
          return new Cluster(cluster);
        })
        .indexBy('id')
        .value();
    };

    return {
      convertClusters: convertClusters
    };
  }

  angular
    .module('Hercules')
    .service('ConverterService', ConverterService);

}());
