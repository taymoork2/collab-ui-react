'use strict';

describe('Controller: Dummy Customer Reports', function () {
  var defaults = getJSONFixture('core/json/partnerReports/commonReportService.json');
  var dummyData = getJSONFixture('core/json/partnerReports/dummyReportData.json');
  var devicesJson = getJSONFixture('core/json/customerReports/devices.json');
  var activeData = getJSONFixture('core/json/customerReports/activeUser.json');
  var DummyCustomerReportService;

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
        data[i].date = moment().subtract(8 - i, defaults.DAY).format(defaults.dayFormat);
      }
    } else if (filter.value === 1) {
      for (var x = 0; x <= 4; x++) {
        data[x].date = moment().day(-1).subtract(4 - x, defaults.WEEK).format(defaults.dayFormat);
      }
    } else if (filter.value === 2) {
      for (var y = 0; y <= 12; y++) {
        data[y].date = moment().day(-1).subtract(12 - y, defaults.WEEK).format(defaults.dayFormat);
      }
    } else {
      for (var z = 0; z <= 52; z++) {
        data[z].date = moment().day(-1).subtract(52 - z, defaults.WEEK).format(defaults.dayFormat);
      }
    }
    return data;
  };

  var updateDates = function (data, filter) {
    if (filter.value === 0) {
      for (var i = 6; i >= 0; i--) {
        data[i].date = moment().subtract(7 - i, defaults.DAY).format(defaults.dayFormat);
      }
    } else if (filter.value === 1) {
      for (var x = 0; x <= 3; x++) {
        data[x].date = moment().startOf(defaults.WEEK).subtract(1 + ((3 - x) * 7), defaults.DAY).format(defaults.dayFormat);
      }
    } else {
      for (var y = 0; y <= 2; y++) {
        data[y].date = moment().subtract((2 - y), defaults.MONTH).format(defaults.monthFormat);
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
      expect(DummyCustomerReportService.dummyActiveUserData(defaults.timeFilter[0], false)).toEqual(updateDates(_.clone(dummyData.activeUser.one), defaults.timeFilter[0]));
      expect(DummyCustomerReportService.dummyActiveUserData(defaults.timeFilter[1], false)).toEqual(updateDates(_.clone(dummyData.activeUser.two), defaults.timeFilter[1]));
      expect(DummyCustomerReportService.dummyActiveUserData(defaults.timeFilter[2], false)).toEqual(updateDates(_.clone(dummyData.activeUser.three), defaults.timeFilter[2]));

      expect(DummyCustomerReportService.dummyActiveUserData(defaults.altTimeFilter[0], true)).toEqual(updateLineDates(_.clone(activeData.dummyData.one), defaults.altTimeFilter[0]));
      expect(DummyCustomerReportService.dummyActiveUserData(defaults.altTimeFilter[1], true)).toEqual(updateLineDates(_.clone(activeData.dummyData.two), defaults.altTimeFilter[1]));
      expect(DummyCustomerReportService.dummyActiveUserData(defaults.altTimeFilter[2], true)).toEqual(updateLineDates(_.clone(activeData.dummyData.three), defaults.altTimeFilter[2]));
      expect(DummyCustomerReportService.dummyActiveUserData(defaults.altTimeFilter[3], true)).toEqual(updateLineDates(_.clone(activeData.dummyData.four), defaults.altTimeFilter[3]));
    });

    it('dummyAvgRoomData should return the expected responses', function () {
      expect(DummyCustomerReportService.dummyAvgRoomData(defaults.timeFilter[0])).toEqual(updateDates(_.clone(dummyData.avgRooms.one), defaults.timeFilter[0]));
      expect(DummyCustomerReportService.dummyAvgRoomData(defaults.timeFilter[1])).toEqual(updateDates(_.clone(dummyData.avgRooms.two), defaults.timeFilter[1]));
      expect(DummyCustomerReportService.dummyAvgRoomData(defaults.timeFilter[2])).toEqual(updateDates(_.clone(dummyData.avgRooms.three), defaults.timeFilter[2]));
    });

    it('dummyFilesSharedData should return the expected responses', function () {
      expect(DummyCustomerReportService.dummyFilesSharedData(defaults.timeFilter[0])).toEqual(updateDates(_.clone(dummyData.filesShared.one), defaults.timeFilter[0]));
      expect(DummyCustomerReportService.dummyFilesSharedData(defaults.timeFilter[1])).toEqual(updateDates(_.clone(dummyData.filesShared.two), defaults.timeFilter[1]));
      expect(DummyCustomerReportService.dummyFilesSharedData(defaults.timeFilter[2])).toEqual(updateDates(_.clone(dummyData.filesShared.three), defaults.timeFilter[2]));
    });

    it('dummyMediaData should return the expected responses', function () {
      expect(DummyCustomerReportService.dummyMediaData(defaults.timeFilter[0])).toEqual(updateDates(_.clone(dummyData.mediaQuality.one), defaults.timeFilter[0]));
      expect(DummyCustomerReportService.dummyMediaData(defaults.timeFilter[1])).toEqual(updateDates(_.clone(dummyData.mediaQuality.two), defaults.timeFilter[1]));
      expect(DummyCustomerReportService.dummyMediaData(defaults.timeFilter[2])).toEqual(updateDates(_.clone(dummyData.mediaQuality.three), defaults.timeFilter[2]));
    });

    it('dummyMetricsData should return the expected responses', function () {
      expect(DummyCustomerReportService.dummyMetricsData()).toEqual(metricsData);
    });

    it('dummyDeviceData should return the expected responses', function () {
      var devicesData = _.clone(devicesJson.dummyData);
      devicesData.one[0].graph = updateDates(devicesData.one[0].graph, defaults.timeFilter[0]);
      devicesData.two[0].graph = updateDates(devicesData.two[0].graph, defaults.timeFilter[1], true);
      devicesData.three[0].graph = updateDates(devicesData.three[0].graph, defaults.timeFilter[2], true);

      expect(DummyCustomerReportService.dummyDeviceData(defaults.timeFilter[0])).toEqual(devicesData.one);
      expect(DummyCustomerReportService.dummyDeviceData(defaults.timeFilter[1])).toEqual(devicesData.two);
      expect(DummyCustomerReportService.dummyDeviceData(defaults.timeFilter[2])).toEqual(devicesData.three);
    });
  });
});
