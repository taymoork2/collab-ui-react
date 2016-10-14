'use strict';

describe('DeviceUsageDistributiongraphService', function () {

  beforeEach(angular.mock.module('Core'));

  var DeviceUsageDistributionGraphService;

  beforeEach(inject(function (_DeviceUsageDistributionGraphService_) {
    DeviceUsageDistributionGraphService = _DeviceUsageDistributionGraphService_;
  }));

  function hours(seconds) {
    return seconds * 3600;
  }

  it('group devices based on how much they are in use', function () {

    var rawData = [
      {
        "accountId": "1111",
        "date": "20161001",
        "totalDuration": hours(12)
      },
      {
        "accountId": "2222",
        "date": "20161001",
        "totalDuration": hours(12)
      },
      {
        "accountId": "2222",
        "date": "20161001",
        "totalDuration": hours(48)
      },
      {
        "accountId": "4444",
        "date": "20161001",
        "totalDuration": hours(168)
      }
    ];

    var distribution = DeviceUsageDistributionGraphService.getUsageDistributionData(rawData);
    expect(distribution.length).toEqual(6);
  });

});
