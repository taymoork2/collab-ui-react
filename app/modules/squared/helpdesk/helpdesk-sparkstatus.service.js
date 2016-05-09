(function () {
  'use strict';

  /* @ngInject */
  function HelpdeskSparkStatusService($q, ReportsService) {

    function getHealthStatuses() {
      var deferred = $q.defer();
      ReportsService.healthMonitor(function (data, status) {
        if (data.success) {
          deferred.resolve(data.components);
        } else {
          deferred.reject(status);
        }
      });
      return deferred.promise;
    }

    function highestSeverity(healthStatuses) {
      var overallSparkStatus = "unknown";
      var error = _.find(healthStatuses, function (data) {
        return data.status === 'error';
      });
      var warning = _.find(healthStatuses, function (data) {
        return data.status === 'warning';
      });
      var major_outage = _.find(healthStatuses, function (data) {
        return data.status === 'major_outage';
      });
      var partialOutage = _.find(healthStatuses, function (data) {
        return data.status === 'partial_outage';
      });
      var operational = _.find(healthStatuses, function (data) {
        return data.status === 'operational';
      });
      var degraded_performance = _.find(healthStatuses, function (data) {
        return data.status === 'degraded_performance';
      });

      var highestSeverity = error || major_outage || warning || partialOutage || degraded_performance || operational;
      if (highestSeverity) {
        overallSparkStatus = highestSeverity.status;
      }
      return overallSparkStatus;
    }

    return {
      getHealthStatuses: getHealthStatuses,
      highestSeverity: highestSeverity
    };
  }

  angular.module('Squared')
    .service('HelpdeskSparkStatusService', HelpdeskSparkStatusService);
}());
