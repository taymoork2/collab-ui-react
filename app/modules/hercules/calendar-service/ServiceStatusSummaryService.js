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

    var serviceFromCluster = function (service_type, cluster) {
      return _.find(cluster.services, {
        service_type: service_type
      });
    };

    return {
      status: status,
      serviceFromCluster: serviceFromCluster
    };
  }

}());
