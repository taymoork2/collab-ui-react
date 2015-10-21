(function () {
  'use strict';

  angular
    .module('Hercules')
    .service('ServiceStatusSummaryService', ServiceStatusSummaryService);

  function ServiceStatusSummaryService() {

    var status = function (service_id, cluster) {
      var service = _.find(cluster.services, {
        service_type: service_id
      });
      if (service === undefined) {
        return {
          status: "unknown"
        };
      } else if (service.alarm_count > 0) {
        return {
          status: "alarm"
        };
      } else return {
        status: service.status
      };
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
      status: status,
      serviceFromCluster: serviceFromCluster,
      serviceNotInstalled: serviceNotInstalled,
      softwareUpgradeAvailable: softwareUpgradeAvailable,
      softwareVersion: softwareVersion

    };
  }

}());
