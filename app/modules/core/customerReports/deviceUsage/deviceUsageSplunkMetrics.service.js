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

    function reportOperation(operation, data) {
      $log.info('reportClick', operation);
      var json = {
        operation: operation,
        data: data
      };

      LogMetricsService.logMetrics(
        'deviceUsageReports',
        LogMetricsService.eventType.deviceUsageReportOperation,
        LogMetricsService.eventAction.buttonClick,
        200,
        moment(),
        1,
        json
      );
    }

    return {
      reportOperation: reportOperation,
      eventTypes: eventTypes
    };
  }
}());
