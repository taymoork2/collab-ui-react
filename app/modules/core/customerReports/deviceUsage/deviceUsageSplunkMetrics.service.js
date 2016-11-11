(function () {
  'use strict';

  angular
    .module('Core')
    .service('DeviceUsageSplunkMetricsService', DeviceUsageSplunkMetricsService);

  /* @ngInject */
  function DeviceUsageSplunkMetricsService($log, LogMetricsService) {

    var eventTypes = {
      fullReportDownload: 'FULLREPORTDOWNLOAD',
      timeRangeSelected: 'TIMERANGESELECTED'
    };

    function reportClick(eventType, operation) {
      $log.info('reportClick', operation);
      var json = {
        operation: operation
      };

      LogMetricsService.logMetrics(
        'deviceUsageReports',
        eventType,
        LogMetricsService.eventAction.buttonClick,
        200,
        moment(),
        1,
        json
      );
    }

    return {
      reportClick: reportClick,
      eventTypes: eventTypes
    };
  }
}());
