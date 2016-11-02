'use strict';

describe('DeviceUsageTotalService', function () {

  beforeEach(angular.mock.module('Core'));

  var DeviceUsageTotalService;

  var day1 = 20161001;

  beforeEach(inject(function (_DeviceUsageTotalService_) {
    DeviceUsageTotalService = _DeviceUsageTotalService_;
  }));

  describe('reducing the raw data', function () {
    it('returns structure containing calculated totals and device category extraction', function () {
      var rawData = [
        {
          "accountId": "1111",
          "date": day1,
          "totalDuration": 10,
          "callCount": 1,
          "pairedCount": 1,
          "deviceCategory": "ce"
        },
        {
          "accountId": "2222",
          "date": day1,
          "totalDuration": 20,
          "callCount": 2,
          "pairedCount": 2,
          "deviceCategory": "ce"
        },
        {
          "accountId": "3333",
          "date": day1,
          "totalDuration": 30,
          "callCount": 3,
          "pairedCount": 3,
          "deviceCategory": "sparkboard"
        },
        {
          "accountId": "4444",
          "date": day1,
          "totalDuration": 40,
          "callCount": 4,
          "pairedCount": 4,
          "deviceCategory": "sparkboard"
        }
      ];

      var result = DeviceUsageTotalService.reduceAllData(rawData, 'day');

      var expectedFullResult = [
        {
          "callCount": 10,
          "totalDuration": "1.67",
          "pairedCount": 10,
          "deviceCategories": {
            "ce": {
              "deviceCategory": "ce",
              "totalDuration": 30,
              "callCount": 3,
              "pairedCount": 3
            },
            "sparkboard": {
              "deviceCategory": "sparkboard",
              "totalDuration": 70,
              "callCount": 7,
              "pairedCount": 7
            }
          },
          "accountIds": {
            "1111": {
              "accountId": "1111",
              "totalDuration": 10,
              "callCount": 1,
              "pairedCount": 1
            },
            "2222": {
              "accountId": "2222",
              "totalDuration": 20,
              "callCount": 2,
              "pairedCount": 2
            },
            "3333": {
              "accountId": "3333",
              "totalDuration": 30,
              "callCount": 3,
              "pairedCount": 3
            },
            "4444": {
              "accountId": "4444",
              "totalDuration": 40,
              "callCount": 4,
              "pairedCount": 4
            }
          },
          "time": "2016-10-01"
        }
      ];
      //TODO: Will the sequence allways be the same, or could we potentiall
      // have a random failure test ?
      expect(result).toEqual(expectedFullResult);
    });

    it('calculates max and min usage and totals', function () {
      var accounts = [
        {
          // "callCount": 10,
          // "totalDuration": "1.67",
          // "pairedCount": 10,
          // "deviceCategories": {
          //   "ce": {
          //     "deviceCategory": "ce",
          //     "totalDuration": 30,
          //     "callCount": 3,
          //     "pairedCount": 3
          //   },
          //   "sparkboard": {
          //     "deviceCategory": "sparkboard",
          //     "totalDuration": 70,
          //     "callCount": 7,
          //     "pairedCount": 7
          //   }
          // },
          "accountIds": {
            "1111": {
              "accountId": "1111",
              "totalDuration": 10,
              "callCount": 2,
              "pairedCount": 2
            },
            "2222": {
              "accountId": "2222",
              "totalDuration": 20,
              "callCount": 2,
              "pairedCount": 2
            },
            "3333": {
              "accountId": "3333",
              "totalDuration": 30,
              "callCount": 2,
              "pairedCount": 2
            },
            "4444": {
              "accountId": "4444",
              "totalDuration": 40,
              "callCount": 2,
              "pairedCount": 2
            },
            "5555": {
              "accountId": "5555",
              "totalDuration": 50,
              "callCount": 2,
              "pairedCount": 2
            },
            "6666": {
              "accountId": "6666",
              "totalDuration": 60,
              "callCount": 2,
              "pairedCount": 2
            },
            "7777": {
              "accountId": "7777",
              "totalDuration": 70,
              "callCount": 2,
              "pairedCount": 2
            }
          },
          "time": "2016-10-01"
        }
      ];

      var stats = DeviceUsageTotalService.extractStats(accounts);
      expect(stats.totalDuration).toEqual(280);
      expect(stats.noOfCalls).toEqual(2 * 7);
      expect(stats.noOfDevices).toEqual(7);
    });
  });

  describe("date ranges", function () {
    it("returns start and end date based floating days", function () {
      var dateRange = DeviceUsageTotalService.getDateRangeForPeriod(7, "day");
      expect(dateRange.start).toEqual(sevenDaysAgo());
      expect(dateRange.end).toEqual(yesterday());
    });

    xit("return start and end date base on start of period", function () {
      //TODO: Test with non-floating window
      DeviceUsageTotalService.getDateRangeForLastNTimeUnits(4, "week");
    });
  });

  function yesterday() {
    return moment().subtract(1, "day").format("YYYY-MM-DD");
  }

  function sevenDaysAgo() {
    return moment().subtract(7, "day").format("YYYY-MM-DD");
  }

});
