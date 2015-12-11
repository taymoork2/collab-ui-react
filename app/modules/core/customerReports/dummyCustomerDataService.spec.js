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
  });
});
