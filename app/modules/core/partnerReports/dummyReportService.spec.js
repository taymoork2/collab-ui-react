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
  var activeUser = angular.copy(dummyData.activeUser);
  var mediaQuality = angular.copy(dummyData.mediaQuality);

  var updateDates = function (data, filter) {
    var dayFormat = "MMM DD";
    var monthFormat = "MMMM";
    if (filter.value === 0) {
      for (var i = 6; i >= 0; i--) {
        data[i].modifiedDate = moment().subtract(7 - i, 'day').format(dayFormat);
      }
    } else if (filter.value === 1) {
      for (var x = 0; x <= 3; x++) {
        data[x].modifiedDate = moment().startOf('week').subtract(1 + (3 - x) * 7, 'day').format(dayFormat);
      }
    } else {
      for (var y = 0; y <= 2; y++) {
        data[y].modifiedDate = moment().subtract((2 - y), 'month').format(monthFormat);
      }
    }
    return data;
  };

  var updateMediaDates = function (data, filter) {
    var dayFormat = "MMM DD";
    var monthFormat = "MMMM";
    if (filter.value === 0) {
      for (var i = 6; i >= 0; i--) {
        data[i].modifiedDate = moment().subtract(8 - i, 'day').format(dayFormat);
      }
    } else if (filter.value === 1) {
      for (var x = 0; x <= 3; x++) {
        data[x].modifiedDate = moment().startOf('week').subtract(1 + (3 - x) * 7, 'day').format(dayFormat);
      }
    } else {
      for (var y = 0; y <= 2; y++) {
        data[y].modifiedDate = moment().subtract((2 - y), 'month').format(monthFormat);
      }
    }
    return data;
  };

  beforeEach(module('Core'));

  describe('Dummy Data Responses', function () {
    beforeEach(inject(function (_DummyReportService_) {
      DummyReportService = _DummyReportService_;
    }));

    it('dummyActiveUserData should return the expected responses', function () {
      activeUser.one = updateDates(activeUser.one, timeFilter[0]);
      activeUser.two = updateDates(activeUser.two, timeFilter[1]);
      activeUser.three = updateDates(activeUser.three, timeFilter[2]);

      expect(DummyReportService.dummyActiveUserData(timeFilter[0])).toEqual(activeUser.one);
      expect(DummyReportService.dummyActiveUserData(timeFilter[1])).toEqual(activeUser.two);
      expect(DummyReportService.dummyActiveUserData(timeFilter[2])).toEqual(activeUser.three);
    });

    it('dummyActivePopulationData should return the expected response', function () {
      expect(DummyReportService.dummyActivePopulationData(customer)).toEqual(angular.copy(dummyData.activeUserPopulation));
    });

    it('dummyMediaQualityData should return the expected responses', function () {
      mediaQuality.one = updateMediaDates(mediaQuality.one, timeFilter[0]);
      mediaQuality.two = updateMediaDates(mediaQuality.two, timeFilter[1]);
      mediaQuality.three = updateMediaDates(mediaQuality.three, timeFilter[2]);

      expect(DummyReportService.dummyMediaQualityData(timeFilter[0])).toEqual(mediaQuality.one);
      expect(DummyReportService.dummyMediaQualityData(timeFilter[1])).toEqual(mediaQuality.two);
      expect(DummyReportService.dummyMediaQualityData(timeFilter[2])).toEqual(mediaQuality.three);
    });

    it('dummyCallMetricsData should return the expected response', function () {
      expect(DummyReportService.dummyCallMetricsData()).toEqual(angular.copy(dummyData.callMetrics));
    });

    it('dummyEndpointData should return the expected response', function () {
      expect(DummyReportService.dummyEndpointData()).toEqual([angular.copy(dummyData.endpoints)]);
    });
  });
});
