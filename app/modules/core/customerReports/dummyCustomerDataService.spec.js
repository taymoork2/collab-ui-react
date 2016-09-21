'use strict';

describe('Controller: Dummy Customer Reports', function () {
  var DummyCustomerReportService;
  var dayFormat = 'MMM DD';
  var monthFormat = 'MMMM';
  var timeFilter = [{
    value: 0
  }, {
    value: 1
  }, {
    value: 2
  }];
  var dummyData = getJSONFixture('core/json/partnerReports/dummyReportData.json');
  var devicesJson = getJSONFixture('core/json/customerReports/devices.json');
  var activeData = getJSONFixture('core/json/customerReports/activeUser.json');

  var metricsData = {
    dataProvider: [{
      callCondition: 'callMetrics.audioCalls',
      numCalls: 1000,
      percentage: 10,
      color: '#F3F3F3'
    }, {
      callCondition: 'callMetrics.videoCalls',
      numCalls: 9000,
      percentage: 90,
      color: '#ECECEC'
    }],
    dummy: true
  };

  var updateLineDates = function (data, filter) {
    if (filter.value === 0) {
      for (var i = 7; i >= 0; i--) {
        data[i].date = moment().subtract(8 - i, 'day').format(dayFormat);
      }
    } else if (filter.value === 1) {
      for (var x = 0; x <= 4; x++) {
        data[x].date = moment().subtract((5 - x) * 7, 'day').format(dayFormat);
      }
    } else {
      for (var y = 0; y <= 13; y++) {
        data[y].date = moment().subtract((14 - y) * 7, 'day').format(dayFormat);
      }
    }
    return data;
  };

  var updateDates = function (data, filter) {
    if (filter.value === 0) {
      for (var i = 6; i >= 0; i--) {
        data[i].date = moment().subtract(7 - i, 'day').format(dayFormat);
      }
    } else if (filter.value === 1) {
      for (var x = 0; x <= 3; x++) {
        data[x].date = moment().startOf('week').subtract(1 + ((3 - x) * 7), 'day').format(dayFormat);
      }
    } else {
      for (var y = 0; y <= 2; y++) {
        data[y].date = moment().subtract((2 - y), 'month').format(monthFormat);
      }
    }
    return data;
  };

  beforeEach(angular.mock.module('Core'));

  describe('Dummy Data Responses', function () {
    beforeEach(inject(function (_DummyCustomerReportService_) {
      DummyCustomerReportService = _DummyCustomerReportService_;
    }));

    it('dummyActiveUserData should return the expected responses', function () {
      expect(DummyCustomerReportService.dummyActiveUserData(timeFilter[0], false)).toEqual(updateDates(_.clone(dummyData.activeUser.one), timeFilter[0]));
      expect(DummyCustomerReportService.dummyActiveUserData(timeFilter[1], false)).toEqual(updateDates(_.clone(dummyData.activeUser.two), timeFilter[1]));
      expect(DummyCustomerReportService.dummyActiveUserData(timeFilter[2], false)).toEqual(updateDates(_.clone(dummyData.activeUser.three), timeFilter[2]));

      expect(DummyCustomerReportService.dummyActiveUserData(timeFilter[0], true)).toEqual(updateLineDates(_.clone(activeData.dummyData.one), timeFilter[0]));
      expect(DummyCustomerReportService.dummyActiveUserData(timeFilter[1], true)).toEqual(updateLineDates(_.clone(activeData.dummyData.two), timeFilter[1]));
      expect(DummyCustomerReportService.dummyActiveUserData(timeFilter[2], true)).toEqual(updateLineDates(_.clone(activeData.dummyData.three), timeFilter[2]));
    });

    it('dummyAvgRoomData should return the expected responses', function () {
      expect(DummyCustomerReportService.dummyAvgRoomData(timeFilter[0])).toEqual(updateDates(_.clone(dummyData.avgRooms.one), timeFilter[0]));
      expect(DummyCustomerReportService.dummyAvgRoomData(timeFilter[1])).toEqual(updateDates(_.clone(dummyData.avgRooms.two), timeFilter[1]));
      expect(DummyCustomerReportService.dummyAvgRoomData(timeFilter[2])).toEqual(updateDates(_.clone(dummyData.avgRooms.three), timeFilter[2]));
    });

    it('dummyFilesSharedData should return the expected responses', function () {
      expect(DummyCustomerReportService.dummyFilesSharedData(timeFilter[0])).toEqual(updateDates(_.clone(dummyData.filesShared.one), timeFilter[0]));
      expect(DummyCustomerReportService.dummyFilesSharedData(timeFilter[1])).toEqual(updateDates(_.clone(dummyData.filesShared.two), timeFilter[1]));
      expect(DummyCustomerReportService.dummyFilesSharedData(timeFilter[2])).toEqual(updateDates(_.clone(dummyData.filesShared.three), timeFilter[2]));
    });

    it('dummyMediaData should return the expected responses', function () {
      expect(DummyCustomerReportService.dummyMediaData(timeFilter[0])).toEqual(updateDates(_.clone(dummyData.mediaQuality.one), timeFilter[0]));
      expect(DummyCustomerReportService.dummyMediaData(timeFilter[1])).toEqual(updateDates(_.clone(dummyData.mediaQuality.two), timeFilter[1]));
      expect(DummyCustomerReportService.dummyMediaData(timeFilter[2])).toEqual(updateDates(_.clone(dummyData.mediaQuality.three), timeFilter[2]));
    });

    it('dummyMetricsData should return the expected responses', function () {
      expect(DummyCustomerReportService.dummyMetricsData()).toEqual(metricsData);
    });

    it('dummyDeviceData should return the expected responses', function () {
      var devicesData = _.clone(devicesJson.dummyData);
      devicesData.one[0].graph = updateDates(devicesData.one[0].graph, timeFilter[0]);
      devicesData.two[0].graph = updateDates(devicesData.two[0].graph, timeFilter[1], true);
      devicesData.three[0].graph = updateDates(devicesData.three[0].graph, timeFilter[2], true);

      expect(DummyCustomerReportService.dummyDeviceData(timeFilter[0])).toEqual(devicesData.one);
      expect(DummyCustomerReportService.dummyDeviceData(timeFilter[1])).toEqual(devicesData.two);
      expect(DummyCustomerReportService.dummyDeviceData(timeFilter[2])).toEqual(devicesData.three);
    });
  });
});
