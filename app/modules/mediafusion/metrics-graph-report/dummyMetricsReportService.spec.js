'use strict';
describe('Controller: Dummy Metrics Reports', function () {
  var DummyMetricsReportService;
  var chartColors;
  var timeFilter = [{
    value: 0
  }, {
    value: 1
  }, {
    value: 2
  }, {
    value: 3
  }];
  beforeEach(angular.mock.module('Mediafusion'));
  describe('Dummy Data Responses', function () {
    beforeEach(inject(function (_DummyMetricsReportService_, _chartColors_) {
      DummyMetricsReportService = _DummyMetricsReportService_;
      chartColors = _chartColors_;
    }));
    it('DummyMetricsReportService should return the expected responses for dummyAvailabilityData', function () {
      var responseFor24hrs = DummyMetricsReportService.dummyAvailabilityData(timeFilter[0]);
      var respomseForLastWeek = DummyMetricsReportService.dummyAvailabilityData(timeFilter[1]);
      var responseForLastMonth = DummyMetricsReportService.dummyAvailabilityData(timeFilter[2]);
      var responseForLastThreeMonth = DummyMetricsReportService.dummyAvailabilityData(timeFilter[3]);

      expect(responseFor24hrs).toBeDefined();
      expect(respomseForLastWeek).toBeDefined();
      expect(responseForLastMonth).toBeDefined();
      expect(responseForLastThreeMonth).toBeDefined();

      expect(responseFor24hrs.data[0].isDummy).toBe(true);
      expect(respomseForLastWeek.data[0].isDummy).toBe(true);
      expect(responseForLastMonth.data[0].isDummy).toBe(true);
      expect(responseForLastThreeMonth.data[0].isDummy).toBe(true);
    });
    it('DummyMetricsReportService should return the expected responses for dummyCallVolumeData', function () {
      var responseFor24hrs = DummyMetricsReportService.dummyCallVolumeData(timeFilter[0]);
      var respomseForLastWeek = DummyMetricsReportService.dummyCallVolumeData(timeFilter[1]);
      var responseForLastMonth = DummyMetricsReportService.dummyCallVolumeData(timeFilter[2]);
      var responseForLastThreeMonth = DummyMetricsReportService.dummyCallVolumeData(timeFilter[3]);

      expect(responseFor24hrs).toBeDefined();
      expect(respomseForLastWeek).toBeDefined();
      expect(responseForLastMonth).toBeDefined();
      expect(responseForLastThreeMonth).toBeDefined();

      expect(responseFor24hrs[0].colorTwo).toBe(chartColors.dummyGray);
      expect(respomseForLastWeek[0].colorTwo).toBe(chartColors.dummyGray);
      expect(responseForLastMonth[0].colorTwo).toBe(chartColors.dummyGray);
      expect(responseForLastThreeMonth[0].colorTwo).toBe(chartColors.dummyGray);

    });
  });
});
