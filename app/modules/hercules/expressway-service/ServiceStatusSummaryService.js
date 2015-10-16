(function () {
  'use strict';

  angular
    .module('Hercules')
    .service('ServiceStatusSummaryService', ServiceStatusSummaryService);

  function ServiceStatusSummaryService() {

    var status = function (service_id, cluster) {
      var calendarService = _.find(cluster.services, {
        service_type: service_id
      });
      var managementService = _.find(cluster.services, {
        service_type: "c_mgmt"
      });
      if (managementService === undefined || managementService.status === "needs_attention") {
        return {
          status: "alarm",
          color: "red"
        };
      } else if (calendarService === undefined) {
        return {
          status: "unknown",
          color: "grey"
        };
      } else if (calendarService.status === "running") {
        return {
          status: "running",
          color: "green"
        };
      } else return {
        status: calendarService.status,
        color: "yellow"
      };
      //return (calendarService !== undefined && calendarService.status === "needs_attention") || (managementService !== undefined && managementService.status === "needs_attention");
    };

    var serviceFromCluster = function (serviceType, cluster) {
      return _.find(cluster.services, {
        service_type: serviceType
      });
    };

    var serviceNotInstalled = function (serviceType, cluster) {
      var serviceInfo = serviceFromCluster(serviceType, cluster);
      if (serviceInfo === undefined) {
        return true;
      } else {
        return serviceInfo.connectors.length === 0;
      }
    };

    var softwareUpgradeAvailable = function (serviceType, cluster) {
      var serviceInfo = serviceFromCluster(serviceType, cluster);
      if (serviceInfo === undefined) {
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
