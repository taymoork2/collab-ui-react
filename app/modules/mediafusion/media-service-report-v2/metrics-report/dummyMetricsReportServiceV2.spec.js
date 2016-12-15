'use strict';

describe('Controller: Dummy Metrics Reports V2', function () {
  var DummyMetricsReportServiceV2;
  var chartColors;
  var timeFilter = [{
    value: 0
  }, {
    value: 1
  }, {
    value: 2
  }, {
    value: 3
  }, {
    value: 4
  }];
  beforeEach(angular.mock.module('Mediafusion'));
  describe('Dummy Data Responses', function () {
    beforeEach(inject(function (_DummyMetricsReportServiceV2_, _chartColors_) {
      DummyMetricsReportServiceV2 = _DummyMetricsReportServiceV2_;
      chartColors = _chartColors_;
    }));
    it('DummyMetricsReportServiceV2 should return the expected responses for dummyAvailabilityData', function () {
      var responseFor24hrs = DummyMetricsReportServiceV2.dummyAvailabilityData(timeFilter[0]);
      var respomseForLastWeek = DummyMetricsReportServiceV2.dummyAvailabilityData(timeFilter[1]);
      var responseForLastMonth = DummyMetricsReportServiceV2.dummyAvailabilityData(timeFilter[2]);
      var responseForLastThreeMonth = DummyMetricsReportServiceV2.dummyAvailabilityData(timeFilter[3]);
      var responseForLastFourHours = DummyMetricsReportServiceV2.dummyAvailabilityData(timeFilter[4]);

      expect(responseFor24hrs).toBeDefined();
      expect(respomseForLastWeek).toBeDefined();
      expect(responseForLastMonth).toBeDefined();
      expect(responseForLastThreeMonth).toBeDefined();
      expect(responseForLastFourHours).toBeDefined();

      expect(responseFor24hrs.data[0].isDummy).toBe(true);
      expect(respomseForLastWeek.data[0].isDummy).toBe(true);
      expect(responseForLastMonth.data[0].isDummy).toBe(true);
      expect(responseForLastThreeMonth.data[0].isDummy).toBe(true);
      expect(responseForLastFourHours.data[0].isDummy).toBe(true);
    });
    it('DummyMetricsReportServiceV2 should return the expected responses for dummyCallVolumeData', function () {
      var responseFor24hrs = DummyMetricsReportServiceV2.dummyCallVolumeData(timeFilter[0]);
      var respomseForLastWeek = DummyMetricsReportServiceV2.dummyCallVolumeData(timeFilter[1]);
      var responseForLastMonth = DummyMetricsReportServiceV2.dummyCallVolumeData(timeFilter[2]);
      var responseForLastThreeMonth = DummyMetricsReportServiceV2.dummyCallVolumeData(timeFilter[3]);
      var responseForLastFourHours = DummyMetricsReportServiceV2.dummyCallVolumeData(timeFilter[4]);

      expect(responseFor24hrs).toBeDefined();
      expect(respomseForLastWeek).toBeDefined();
      expect(responseForLastMonth).toBeDefined();
      expect(responseForLastThreeMonth).toBeDefined();
      expect(responseForLastFourHours).toBeDefined();

      expect(responseFor24hrs[0].colorTwo).toBe(chartColors.dummyGray);
      expect(respomseForLastWeek[0].colorTwo).toBe(chartColors.dummyGray);
      expect(responseForLastMonth[0].colorTwo).toBe(chartColors.dummyGray);
      expect(responseForLastThreeMonth[0].colorTwo).toBe(chartColors.dummyGray);
      expect(responseForLastFourHours[0].colorTwo).toBe(chartColors.dummyGray);
    });
  });
});
