'use strict';

describe('DeviceUsageMockService', function () {

  beforeEach(angular.mock.module('Core'));

  var $timeout, DeviceUsageMockService, DeviceUsageMockData;

  var day1 = 20161001;
  var day2 = 20161002;

  beforeEach(inject(function (_$timeout_, _DeviceUsageMockService_, _DeviceUsageMockData_) {
    DeviceUsageMockService = _DeviceUsageMockService_;
    DeviceUsageMockData = _DeviceUsageMockData_;
    $timeout = _$timeout_;
  }));

  describe('fetching summed devices usage', function () {
    it('returns one data row with the sum of all devices for a day', function (done) {
      var rawData = [
        {
          "accountId": "1111",
          "date": day1,
          "totalDuration": 10,
          "deviceCategory": "ce"
        },
        {
          "accountId": "2222",
          "date": day1,
          "totalDuration": 10,
          "deviceCategory": "ce"
        },
        {
          "accountId": "3333",
          "date": day1,
          "totalDuration": 10,
          "deviceCategory": "ce"
        }
      ];

      sinon.stub(DeviceUsageMockData, 'getRawData');
      DeviceUsageMockData.getRawData.withArgs(sinon.match.any, sinon.match.any).returns(rawData);

      DeviceUsageMockService.getData(day1, day1).then(function (data) {
        expect(data.length).toEqual(1);
        expect(data[0].date).toEqual(day1);
        expect(data[0].deviceCategory).toEqual("ce");
        expect(data[0].totalDuration).toEqual(30);
        done();
      });

      $timeout.flush();
    });

    it('returns one row for each device category for a day', function (done) {
      var rawData = [
        {
          "accountId": "1111",
          "date": day1,
          "totalDuration": 10,
          "deviceCategory": "ce"
        },
        {
          "accountId": "2222",
          "date": day1,
          "totalDuration": 10,
          "deviceCategory": "ce"
        },
        {
          "accountId": "3333",
          "date": day1,
          "totalDuration": 10,
          "deviceCategory": "darling"
        }
      ];

      sinon.stub(DeviceUsageMockData, 'getRawData');
      DeviceUsageMockData.getRawData.withArgs(sinon.match.any, sinon.match.any).returns(rawData);

      DeviceUsageMockService.getData(day1, day1).then(function (data) {
        expect(data.length).toEqual(2);
        expect(data[0].date).toEqual(day1);
        expect(data[0].deviceCategory).toEqual("ce");
        expect(data[0].totalDuration).toEqual(20);

        expect(data[1].date).toEqual(day1);
        expect(data[1].deviceCategory).toEqual("darling");
        expect(data[1].totalDuration).toEqual(10);
        done();
      });

      $timeout.flush();
    });


    it('adds up total usage for devices pr day and type', function (done) {

      var rawData = [
        {
          "accountId": "1111",
          "date": day1,
          "totalDuration": 10,
          "deviceCategory": "ce"
        },
        {
          "accountId": "1111",
          "date": day1,
          "totalDuration": 10,
          "deviceCategory": "darling"
        },
        {
          "accountId": "2222",
          "date": day1,
          "totalDuration": 4,
          "deviceCategory": "darling"
        },
        {
          "accountId": "2222",
          "date": day2,
          "totalDuration": 15,
          "deviceCategory": "ce"
        },
        {
          "accountId": "3333",
          "date": day2,
          "totalDuration": 15,
          "deviceCategory": "ce"
        },
        {
          "accountId": "4444",
          "date": day2,
          "totalDuration": 2,
          "deviceCategory": "ce"
        }
      ];

      sinon.stub(DeviceUsageMockData, 'getRawData');
      DeviceUsageMockData.getRawData.withArgs(sinon.match.any, sinon.match.any).returns(rawData);

      DeviceUsageMockService.getData(day1, day2).then(function (data) {

        expect(data.length).toEqual(3);

        expect(data[0].date).toEqual(day1);
        expect(data[0].deviceCategory).toEqual("ce");
        expect(data[0].totalDuration).toEqual(10);

        expect(data[1].date).toEqual(day1);
        expect(data[1].deviceCategory).toEqual("darling");
        expect(data[1].totalDuration).toEqual(14);

        expect(data[2].date).toEqual(day2);
        expect(data[2].deviceCategory).toEqual("ce");
        expect(data[2].totalDuration).toEqual(32);

        done();
      });

      $timeout.flush();
    });
  });

  describe('fetching devices individual usage', function () {
    it('returns individual data for each accountId and deviceCategory for each day', function (done) {

      var rawData = [
        {
          "accountId": "1111",
          "date": day1,
          "totalDuration": 10,
          "deviceCategory": "ce"
        },
        {
          "accountId": "1111",
          "date": day1,
          "totalDuration": 10,
          "deviceCategory": "darling"
        },
        {
          "accountId": "2222",
          "date": day1,
          "totalDuration": 4,
          "deviceCategory": "darling"
        },
        {
          "accountId": "2222",
          "date": day2,
          "totalDuration": 15,
          "deviceCategory": "ce"
        },
        {
          "accountId": "3333",
          "date": day2,
          "totalDuration": 15,
          "deviceCategory": "ce"
        },
        {
          "accountId": "4444",
          "date": day2,
          "totalDuration": 2,
          "deviceCategory": "ce"
        }
      ];

      sinon.stub(DeviceUsageMockData, 'getRawData');
      DeviceUsageMockData.getRawData.withArgs(sinon.match.any, sinon.match.any).returns(rawData);

      DeviceUsageMockService.getData(day1, day2, true).then(function (data) {
        expect(data.length).toEqual(6);
        done();
      });

      $timeout.flush();
    });

  });
});
