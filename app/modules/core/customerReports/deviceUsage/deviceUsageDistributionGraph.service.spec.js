'use strict';

describe('DeviceUsageDistributiongraphService', function () {

  beforeEach(angular.mock.module('Core'));

  var $timeout, DeviceUsageDistributionReportService, DeviceUsageDistributionGraphService, $q;

  beforeEach(inject(function (_$timeout_, _$q_, _DeviceUsageDistributionReportService_, _DeviceUsageDistributionGraphService_) {
    DeviceUsageDistributionGraphService = _DeviceUsageDistributionGraphService_;
    DeviceUsageDistributionReportService = _DeviceUsageDistributionReportService_;
    $timeout = _$timeout_;
    $q = _$q_;
  }));

  function hours(seconds) {
    return seconds * 3600;
  }

  it('group devices based on how much they are in use', function (done) {

    var rawData = [
      {
        "accountId": "1111",
        "date": "20161001",
        "totalDuration": hours(12)
      },
      {
        "accountId": "2222",
        "date": "20161001",
        "totalDuration": hours(24)
      },
      {
        "accountId": "3333",
        "date": "20161001",
        "totalDuration": hours(48)
      },
      {
        "accountId": "4444",
        "date": "20161001",
        "totalDuration": hours(168)
      }
    ];

    sinon.stub(DeviceUsageDistributionReportService, 'getDeviceUsageReportData');
    DeviceUsageDistributionReportService.getDeviceUsageReportData.withArgs(sinon.match.any, sinon.match.any).returns($q.resolve(rawData));

    DeviceUsageDistributionGraphService.getUsageDistributionData().then(function (data) {
      expect(data).toEqual("fiskekake");
      done();
    });

    $timeout.flush();
  });

});
