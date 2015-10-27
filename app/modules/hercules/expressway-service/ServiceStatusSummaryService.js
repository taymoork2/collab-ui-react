(function () {
  'use strict';

  angular
    .module('Hercules')
    .service('ServiceStatusSummaryService', ServiceStatusSummaryService);

  function ServiceStatusSummaryService() {

    // TODO: Dont run it for each rendering. Make it a part of i.e. converter-service instead...
    var clusterAggregatedStatus = function (service_id, cluster) {
      var clusterStatus = "Unknown";

      var service = _.find(cluster.services, {
        service_type: service_id
      });

      var nfOfConnectorsInState = function (service, state) {
        var connectorsInState = _.filter(service.connectors, {
          state: state
        });
        return connectorsInState.length || 0;
      };

      var nrOfConnectorsWithAlarm = function (service) {
        var connectorsWithAlarms = _.filter(service.connectors, function (connector) {
          var noAlarm = (connector.alarms === undefined || connector.alarms.length === 0);
          return !noAlarm;
        });
        return connectorsWithAlarms.length || 0;
      };

      var nrOfConnectors = service.connectors.length || 0;
      if (nrOfConnectorsWithAlarm(service) > 0) {
        clusterStatus = "alarm";
      } else if (nfOfConnectorsInState(service, "running") === nrOfConnectors) {
        clusterStatus = "running";
      } else if (nfOfConnectorsInState(service, "disabled") > 0) {
        clusterStatus = "disabled"; // ???
      } else if (nfOfConnectorsInState(service, "not_configured") > 0) {
        clusterStatus = "not_configured";
      } else if (nfOfConnectorsInState(service, "uninstalling") > 0 || nfOfConnectorsInState(service, "downloading") > 0 || nfOfConnectorsInState(service, "installing") > 0) {
        clusterStatus = "installing";
      } else if (nfOfConnectorsInState(service, "stopped") > 0) {
        clusterStatus = "stopped";
      } else if (nfOfConnectorsInState(service, "offline") > 0) {
        clusterStatus = "offline";
      } else if (nfOfConnectorsInState(service, "not_installed") > 0) {
        clusterStatus = "not_installed";
      }
      return clusterStatus;
    };

    var serviceFromCluster = function (serviceType, cluster) {
      if (!cluster || !cluster.services) {
        return null;
      }
      return _.find(cluster.services, {
        service_type: serviceType
      });
    };

    var serviceNotInstalled = function (serviceType, cluster) {
      var serviceInfo = serviceFromCluster(serviceType, cluster);
      if (!serviceInfo) {
        return true;
      } else {
        return serviceInfo.connectors.length === 0;
      }
    };

    var softwareUpgradeAvailable = function (serviceType, cluster) {
      var serviceInfo = serviceFromCluster(serviceType, cluster);
      if (!serviceInfo) {
        return false;
      } else {
        return serviceInfo.software_upgrade_available;
      }
    };

    var softwareVersion = function (serviceType, cluster) {
      return serviceFromCluster(serviceType, cluster).software_upgrade_available ? serviceFromCluster(serviceType, cluster).not_approved_package.version : "?";
    };

    return {
      clusterAggregatedStatus: clusterAggregatedStatus,
      serviceFromCluster: serviceFromCluster,
      serviceNotInstalled: serviceNotInstalled,
      softwareUpgradeAvailable: softwareUpgradeAvailable,
      softwareVersion: softwareVersion
    };
  }

}());

/*
 State

 (not_installed)
 (The connector is not installed, state after initial registration)

 uninstalling
 Uninstalling an existing connector (prior to new version getting installed)

 downloading
 Downloading the connector

 installing
 Installing the connector

 not_configured
 The connector is installed and disabled, but has not been configured yet

 disabled
 Disabled (turned off by admin or has not yet been enabled)

 running (Grønn)
 Enabled and running (but not necessarily working, alarms will be raised if that is the case)

 stopped
 Enabled and not running (crashed, unable to start, should raise an alarm)

 Offline
 Offline




 En eller flere hosts connector er stopped:
 needs_attention ?
 or
 x connectors stopped

 Hva med active-active når man bare har en host i cluster ?




 Farge:

 ORANGE:
 Not configured
 Disabled
 Upgrades
 Installing (Cluster aggregated)


 GREEN:
 Running

 RED:
 Alarms
 Needs_attention




 Aggregated pr cluster:
 Running - all running
 Disabled - service disabled on cluster
 Not configured, downloading, upgrade avail, upgrading, installing, uninstall = installing (ORANGE)
   II
   VV


 */
