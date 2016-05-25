(function () {
  'use strict';

  /* @ngInject */
  function HelpdeskSplunkReporterService(LogMetricsService) {

    function reportStats(searchString, res, startTime, orgId) {

      var endTime = moment();
      var results = [];
      var errors = [];

      _.each(res, function (result) {
        var details = result.details;
        if (angular.isArray(details)) {
          results.push(result.searchType + " returned " + result.details.length + " results.");
        } else {
          errors.push(result.searchType + " returned errors:" + result.details);
        }
      });

      var json = {
        operation: "search",
        searchTime: getTotalSearchTimeInMs(startTime, endTime),
        searchString: searchString,
        withinOrg: orgId != null,
        nrOfRequests: res.length,
        searchResult: results,
        searchError: errors
      };

      LogMetricsService.logMetrics(
        'helpdesk',
        LogMetricsService.eventType.helpdeskSearch,
        LogMetricsService.eventAction.buttonClick,
        200,
        startTime,
        1,
        json
      );

      return json;
    }

    function reportOperation(operation) {
      var json = {
        operation: operation
      };

      LogMetricsService.logMetrics(
        'helpdesk',
        LogMetricsService.eventType.helpdeskOperation,
        LogMetricsService.eventAction.buttonClick,
        200,
        moment(),
        1,
        json
      );
    }

    function getTotalSearchTimeInMs(startTime, endTime) {
      var elapsedTime = moment(endTime, 'DD/MM/YYYY HH:mm:ss').diff(moment(startTime, 'DD/MM/YYYY HH:mm:ss'));
      return elapsedTime;
    }

    return {
      reportStats: reportStats,
      reportOperation: reportOperation,
      USER_SEARCH: "User search",
      DEVICE_SEARCH: "Device search",
      DEVICE_SEARCH_HURON: "Huron device search",
      DEVICE_SEARCH_HURON_NUMBER: "Huron device number search",
      DEVICE_SEARCH_CLOUDBERRY: "Cloudberry device search",
      ORG_SEARCH: "Org search",
      SEARCH_HISTORY: "searchHistory",
      SEARCH_HELP: "searchHelp",
      SPARK_STATUS: "sparkStatus"
    };
  }

  angular.module('Squared')
    .service('HelpdeskSplunkReporterService', HelpdeskSplunkReporterService);
}());
