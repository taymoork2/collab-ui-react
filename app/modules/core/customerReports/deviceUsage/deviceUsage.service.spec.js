'use strict';

describe('DeviceUsageService', function () {

  beforeEach(angular.mock.module('Core'));

  var DeviceUsageService;

  afterEach(function () {
    DeviceUsageService = undefined;
  });

  beforeEach(inject(function (_DeviceUsageService_) {
    DeviceUsageService = _DeviceUsageService_;
  }));

  describe('reducing raw data from API', function () {
    it('returns structure containing calculated totals pr day', function () {
      var rawDataDay1 = [
        {
          "date": "2017-01-31T00:00:00.000Z",
          "accountId": "*",
          "category": "ce",
          "model": "SX20",
          "countryCode": "*",
          "callCount": 6,
          "callDuration": 2500
        },
        {
          "date": "2017-01-31T00:00:00.000Z",
          "accountId": "*",
          "category": "ce",
          "model": "MX700",
          "countryCode": "*",
          "callCount": 5,
          "callDuration": 1000
        }
      ];

      var rawDataDay2 = [
        {
          "date": "2017-01-30T00:00:00.000Z",
          "accountId": "*",
          "category": "ce",
          "model": "SX20",
          "countryCode": "*",
          "callCount": 4,
          "callDuration": 500
        }, {
          "date": "2017-01-30T00:00:00.000Z",
          "accountId": "*",
          "category": "SparkBoard",
          "model": "SparkBoard 55",
          "countryCode": "*",
          "callCount": 2,
          "callDuration": 1000
        }
      ];

      var rawDataDay3 = []; // no data

      var rawDataDay4 = [
        {
          "date": "2017-01-28T00:00:00.000Z",
          "accountId": "*",
          "category": "ce",
          "model": "SX20",
          "countryCode": "*",
          "callCount": 2,
          "callDuration": 500
        },
        {
          "date": "2017-01-28T00:00:00.000Z",
          "accountId": "*",
          "category": "SparkBoard",
          "model": "SparkBoard 55",
          "countryCode": "*",
          // "callCount": 0, // missing callCount same as 0
          // "callDuration": 500  // missing callDuration same as 0
        }
      ];

      var rawData = rawDataDay4
        .concat(rawDataDay3)
        .concat(rawDataDay2)
        .concat(rawDataDay1);

      var expectedResult = [{
        callCount: 2,
        totalDuration: 500,
        totalDurationY: '0.14',
        time: '2017-01-28'
      }, {
        callCount: 6,
        totalDuration: 1500,
        totalDurationY: '0.42',
        time: '2017-01-30'
      }, {
        callCount: 11,
        totalDuration: 3500,
        totalDurationY: '0.97',
        time: '2017-01-31'
      }];

      var result = DeviceUsageService.reduceAllData(rawData, 'day');
      expect(result).toEqual(expectedResult);
    });
  });
});
