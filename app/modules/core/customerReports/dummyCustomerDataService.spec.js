'use strict';

describe('Controller: Dummy Customer Reports', function () {
  var DummyCustomerReportService;
  var timeFilter = [{
    value: 0
  }, {
    value: 1
  }, {
    value: 2
  }];
  var dummyData = getJSONFixture('core/json/partnerReports/dummyReportData.json');
  var activeUser = angular.copy(dummyData.activeUser);
  var avgRooms = angular.copy(dummyData.avgRooms);
  var filesShared = angular.copy(dummyData.filesShared);
  var mediaQuality = angular.copy(dummyData.mediaQuality);
  var devicesJson = getJSONFixture('core/json/customerReports/devices.json');
  var devicesData = angular.copy(devicesJson.dummyData);

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
    beforeEach(inject(function (_DummyCustomerReportService_) {
      DummyCustomerReportService = _DummyCustomerReportService_;
    }));

    it('dummyActiveUserData should return the expected responses', function () {
      activeUser.one = updateDates(activeUser.one, timeFilter[0]);
      activeUser.two = updateDates(activeUser.two, timeFilter[1]);
      activeUser.three = updateDates(activeUser.three, timeFilter[2]);

      expect(DummyCustomerReportService.dummyActiveUserData(timeFilter[0])).toEqual(activeUser.one);
      expect(DummyCustomerReportService.dummyActiveUserData(timeFilter[1])).toEqual(activeUser.two);
      expect(DummyCustomerReportService.dummyActiveUserData(timeFilter[2])).toEqual(activeUser.three);
    });

    it('dummyAvgRoomData should return the expected responses', function () {
      avgRooms.one = updateDates(avgRooms.one, timeFilter[0]);
      avgRooms.two = updateDates(avgRooms.two, timeFilter[1]);
      avgRooms.three = updateDates(avgRooms.three, timeFilter[2]);

      expect(DummyCustomerReportService.dummyAvgRoomData(timeFilter[0])).toEqual(avgRooms.one);
      expect(DummyCustomerReportService.dummyAvgRoomData(timeFilter[1])).toEqual(avgRooms.two);
      expect(DummyCustomerReportService.dummyAvgRoomData(timeFilter[2])).toEqual(avgRooms.three);
    });

    it('dummyFilesSharedData should return the expected responses', function () {
      filesShared.one = updateDates(filesShared.one, timeFilter[0]);
      filesShared.two = updateDates(filesShared.two, timeFilter[1]);
      filesShared.three = updateDates(filesShared.three, timeFilter[2]);

      expect(DummyCustomerReportService.dummyFilesSharedData(timeFilter[0])).toEqual(filesShared.one);
      expect(DummyCustomerReportService.dummyFilesSharedData(timeFilter[1])).toEqual(filesShared.two);
      expect(DummyCustomerReportService.dummyFilesSharedData(timeFilter[2])).toEqual(filesShared.three);
    });

    it('dummyMediaData should return the expected responses', function () {
      mediaQuality.one = updateMediaDates(mediaQuality.one, timeFilter[0]);
      mediaQuality.two = updateMediaDates(mediaQuality.two, timeFilter[1]);
      mediaQuality.three = updateMediaDates(mediaQuality.three, timeFilter[2]);

      expect(DummyCustomerReportService.dummyMediaData(timeFilter[0])).toEqual(mediaQuality.one);
      expect(DummyCustomerReportService.dummyMediaData(timeFilter[1])).toEqual(mediaQuality.two);
      expect(DummyCustomerReportService.dummyMediaData(timeFilter[2])).toEqual(mediaQuality.three);
    });

    it('dummyMetricsData should return the expected responses', function () {
      expect(DummyCustomerReportService.dummyMetricsData()).toEqual(metricsData);
    });

    it('dummyDeviceData should return the expected responses', function () {
      devicesData.one[0].graph = updateDates(devicesData.one[0].graph, timeFilter[0]);
      devicesData.two[0].graph = updateDates(devicesData.two[0].graph, timeFilter[1], true);
      devicesData.three[0].graph = updateDates(devicesData.three[0].graph, timeFilter[2], true);

      expect(DummyCustomerReportService.dummyDeviceData(timeFilter[0])).toEqual(devicesData.one);
      expect(DummyCustomerReportService.dummyDeviceData(timeFilter[1])).toEqual(devicesData.two);
      expect(DummyCustomerReportService.dummyDeviceData(timeFilter[2])).toEqual(devicesData.three);
    });
  });
});
