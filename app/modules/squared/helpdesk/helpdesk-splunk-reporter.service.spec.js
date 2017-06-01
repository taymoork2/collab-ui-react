'use strict';

describe('Service: HelpdeskSplunkReporterService', function () {
  beforeEach(angular.mock.module('Squared'));

  var LogMetricsService, Service;

  beforeEach(inject(function (_LogMetricsService_, _HelpdeskSplunkReporterService_) {
    Service = _HelpdeskSplunkReporterService_;
    LogMetricsService = _LogMetricsService_;
  }));

  describe("splunk reporting", function () {

    it("reportOperation reports to logMetricsService", function () {
      spyOn(LogMetricsService, 'logMetrics');
      Service.reportOperation("whatever");
      expect(LogMetricsService.logMetrics.calls.count()).toBe(1);
    });

    it("reportStats reports to logMetriceService", function () {
      spyOn(LogMetricsService, 'logMetrics');
      Service.reportStats("searchString", {}, moment(), "1234");
      expect(LogMetricsService.logMetrics.calls.count()).toBe(1);
    });

    it("reportOperation reports as HELPDESKOPERATION", function () {
      var logMetrics = spyOn(LogMetricsService, 'logMetrics');
      Service.reportOperation("search");
      var anyTime = jasmine.any(Object);
      expect(logMetrics).toHaveBeenCalledWith(
        "helpdesk",
        "HELPDESKOPERATION",
        "BUTTONCLICK",
        200,
        anyTime,
        1, {
          "operation": "search",
        }
      );
    });

    it("reportStats reports as HELPDESKSEARCH", function () {
      var logMetrics = spyOn(LogMetricsService, 'logMetrics');

      var searchString = "whatever";
      var result = {
        "result": "whatever",
      };
      var orgId = "12345";
      var statsResult = Service.reportStats(searchString, result, moment(), orgId);

      var anyTime = jasmine.any(Object);
      var anyJsonBlob = jasmine.any(Object);

      expect(logMetrics).toHaveBeenCalledWith(
        "helpdesk",
        "HELPDESKSEARCH",
        "BUTTONCLICK",
        200,
        anyTime,
        1,
        anyJsonBlob
      );

      expect(statsResult.operation).toBe("search");
    });

  });

});
