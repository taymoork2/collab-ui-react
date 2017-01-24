'use strict';

describe('DeviceUsageDateService', function () {

  beforeEach(angular.mock.module('Core'));

  var DeviceUsageDateService;

  afterEach(function () {
    DeviceUsageDateService = undefined;
  });

  beforeEach(inject(function (_DeviceUsageDateService_) {
    DeviceUsageDateService = _DeviceUsageDateService_;
  }));

  describe("date ranges", function () {

    beforeEach(function () {
      jasmine.clock().install();
      var baseTime = moment('2016-10-26').toDate(); // Wed, Oct, 2016
      jasmine.clock().mockDate(baseTime);
    });

    afterEach(function () {
      jasmine.clock().uninstall();
    });

    it("returns start and end date based floating last 7 days", function () {
      var dateRange = DeviceUsageDateService.getDateRangeForLastNTimeUnits(7, "day");
      expect(dateRange.start).toEqual("2016-10-19");
      expect(dateRange.end).toEqual("2016-10-25");
    });

    it("return start and end date for last 4 weeks", function () {
      var dateRange = DeviceUsageDateService.getDateRangeForLastNTimeUnits(4, "week");
      expect(dateRange.start).toEqual("2016-09-26"); // First Monday 4 weeks ago
      expect(dateRange.end).toEqual("2016-10-23"); // Sunday last week
    });

    it("return start and end date for last 3 months", function () {
      var dateRange = DeviceUsageDateService.getDateRangeForLastNTimeUnits(3, "month");
      expect(dateRange.start).toEqual("2016-07-01"); // first day in July
      expect(dateRange.end).toEqual("2016-09-30"); // last day in Sept
    });

    it('return start and end date for last 6 months', function () {
      var dateRange = DeviceUsageDateService.getDateRangeForLastNTimeUnits(6, 'month');
      expect(dateRange.start).toEqual('2016-04-01');
      expect(dateRange.end).toEqual('2016-09-30');
    });

    it('return start and end date for last 12 months', function () {
      var dateRange = DeviceUsageDateService.getDateRangeForLastNTimeUnits(12, 'month');
      expect(dateRange.start).toEqual('2015-10-01');
      expect(dateRange.end).toEqual('2016-09-30');
    });

  });

});
