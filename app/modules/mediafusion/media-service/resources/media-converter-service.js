(function ($log) {
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
        return service.service_type == 'mf_mgmt';
      })
      .pluck('connectors')
      .flatten()
      .find(function (connector) {
        return connector.state != 'disabled';
      })
      .value();

    this.any_service_connectors_not_configured = _.chain(cluster.services)
      .filter(function (service) {
        return service.service_type == 'mf_mgmt';
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

  function AggregateClusters(clusters, groupList) {

    var groups = [];
    var clusterArray = [];

    _.each(clusters, function (cluster) {
      if (cluster.properties["mf.group.displayName"] != null) {
        clusterArray.push(cluster);
      }
    });

    function sortOn(collection, name) {
      collection.sort(function (a, b) {
        var groupA = a.properties["mf.group.displayName"];
        var groupB = b.properties["mf.group.displayName"];

        if (groupA < groupB) {
          return (-1);
        }
        if (groupA > groupB) {
          return (1);
        }
        return (0);
      });
    }

    function groupBy(attribute, groupList) {
      // First sort the clusters/connectors based on group name
      sortOn(clusterArray, attribute);
      var groupName = "_DEFAULT_GROUP_NAME_";
      var group = "_DEFAULT_GROUP";
      var presentGroupNameList = [];
      // Group the sorted cluster/connector based on group name
      for (var i = 0; i < clusterArray.length; i++) {
        var cluster = clusterArray[i];
        var groupDisplayName = cluster.properties["mf.group.displayName"];

        // Filter out the cluster/connector with empty group name
        if (groupDisplayName == null)
          continue;

        if (groupDisplayName !== groupName) {
          group = {
            groupName: groupDisplayName,
            serviceStatus: null,
            clusters: []
          };
          groupName = group.groupName;
          groups.push(group);
        }
        group.clusters.push(cluster);
        // console.log("groups value: "+groups);
      }

      // Update aggregated service status for each group
      _.each(groups, function (group) {
        group.serviceStatus = clusterAggregatedStatus(group);
        presentGroupNameList.push(group.groupName);
      });

      // Adding Empty groups
      //var groupList = 
      // console.log("grroup list 5 : ", groupList);
      _.each(groupList, function (groupName) {
        if (presentGroupNameList.indexOf(groupName) <= -1) {
          group = {
            groupName: groupName,
            serviceStatus: "nohosts",
            clusters: []
          };
          groups.push(group);
        }
      });
    }

    function clusterAggregatedStatus(group) {
      var clusterStatus = "Unknown";
      var clusters = group.clusters;

      function numberOfConnectorsInState(group, state) {
        var connectorsInState = 0;
        _.each(group.clusters, function (cluster) {
          if (cluster.services[0].connectors[0].state === state) {
            connectorsInState = connectorsInState + 1;
          }
        });

        return connectorsInState;
      }

      function numberOfConnectorsWithAlarm(group) {
        var connectorsWithAlarms = 0;
        _.each(group.clusters, function (cluster) {
          if (!(cluster.services[0].connectors[0].alarms === undefined || cluster.services[0].connectors[0].alarms.length === 0)) {
            connectorsWithAlarms = connectorsWithAlarms + 1;
          }
        });

        return connectorsWithAlarms;
      }

      // aggregated service status for each GROUP based on status of each cluster/connector
      var numberOfConnectors = clusters.length || 0;
      if (numberOfConnectorsWithAlarm(group) > 0) {
        clusterStatus = "alarm";
      } else if (numberOfConnectorsInState(group, "running") === numberOfConnectors) {
        clusterStatus = "running";
      } else if (numberOfConnectorsInState(group, "disabled") > 0) {
        clusterStatus = "disabled";
      } else if (numberOfConnectorsInState(group, "not_configured") > 0) {
        clusterStatus = "not_configured";
      } else if (numberOfConnectorsInState(group, "uninstalling") > 0 || numberOfConnectorsInState(group, "downloading") > 0 || numberOfConnectorsInState(group, "installing") > 0) {
        clusterStatus = "installing";
      } else if (numberOfConnectorsInState(group, "stopped") > 0) {
        clusterStatus = "stopped";
      } else if (numberOfConnectorsInState(group, "offline") > 0) {
        clusterStatus = "offline";
      } else if (numberOfConnectorsInState(group, "not_installed") > 0) {
        clusterStatus = "not_installed";
      }
      return clusterStatus;
    }

    groupBy("groupName", groupList);
    return groups;
  }

  function MediaConverterService() {

    var convertClusters = function (data) {
      return _.chain(data)
        .map(function (cluster) {
          return new Cluster(cluster);
        })
        .indexBy('id')
        .value();
    };

    // FMS Cluster have one-to-one relationship to media connector. Each connector will have unique cluster ID.
    // Mediafusion Group is different from Cluster and Clusters/Connectors are grouped based on groupName.
    // Media Clusters displayed in Media Service UI are basically Groups.
    // Aggregated Service Status is result of aggregation of status of each cluster/connector present in Group.

    var aggregateClusters = function (clusters, groupList) {
      return new AggregateClusters(clusters, groupList);
    };

    return {
      convertClusters: convertClusters,
      aggregateClusters: aggregateClusters
    };
  }

  angular
    .module('Mediafusion')
    .service('MediaConverterService', MediaConverterService);

}());
