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
        clusterStatus = "disabled";
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
      if (!(cluster.provisioning_data && cluster.provisioning_data.not_approved_packages)) {
        return false;
      }

      var sw_available = _.find(cluster.provisioning_data.not_approved_packages, function (pkg) {
        return pkg.service.service_type == serviceType;
      });
      return (sw_available !== undefined);
    };

    //var softwareUpgradeAvailable = function (serviceType, cluster) {
    //  var serviceInfo = serviceFromCluster(serviceType, cluster);
    //  if (!serviceInfo) {
    //    return false;
    //  } else {
    //    return serviceInfo.software_upgrade_available || false;
    //  }
    //};

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
