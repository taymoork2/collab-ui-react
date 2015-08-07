'use strict';

describe('Controller: Dummy Reports', function () {
  var DummyReportService;
  var timeFilter = [{
    value: 0
  }, {
    value: 1
  }, {
    value: 2
  }];
  var customer = {
    value: "6f631c7b-04e5-4dfe-b359-47d5fa9f4837",
    label: "Test Org One"
  };
  var dummyData = getJSONFixture('core/json/partnerReports/dummyReportData.json');

  beforeEach(module('Core'));

  describe('Dummy Data Responses', function () {
    beforeEach(inject(function (_DummyReportService_) {
      DummyReportService = _DummyReportService_;
    }));

    it('dummyActiveUserData should return the expected responses', function () {
      expect(DummyReportService.dummyActiveUserData(timeFilter[0])).toEqual(angular.copy(dummyData.activeUser.one));
      expect(DummyReportService.dummyActiveUserData(timeFilter[1])).toEqual(angular.copy(dummyData.activeUser.two));
      expect(DummyReportService.dummyActiveUserData(timeFilter[2])).toEqual(angular.copy(dummyData.activeUser.three));
    });

    it('dummyActivePopulationData should return the expected response', function () {
      expect(DummyReportService.dummyActivePopulationData(customer)).toEqual(angular.copy(dummyData.activeUserPopulation));
    });

    it('dummyMediaQualityData should return the expected responses', function () {
      expect(DummyReportService.dummyMediaQualityData(timeFilter[0])).toEqual(angular.copy(dummyData.mediaQuality.one));
      expect(DummyReportService.dummyMediaQualityData(timeFilter[1])).toEqual(angular.copy(dummyData.mediaQuality.two));
      expect(DummyReportService.dummyMediaQualityData(timeFilter[2])).toEqual(angular.copy(dummyData.mediaQuality.three));
    });

    it('dummyCallMetricsData should return the expected response', function () {
      expect(DummyReportService.dummyCallMetricsData()).toEqual(angular.copy(dummyData.callMetrics));
    });
  });
});
