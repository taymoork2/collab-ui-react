'use strict';

describe('DeviceUsageDistributionReportService', function () {

  beforeEach(angular.mock.module('Core'));

  var $timeout, DeviceUsageRawService, DeviceUsageDistributionReportService, $q;

  beforeEach(inject(function (_$timeout_, _$q_, _DeviceUsageRawService_, _DeviceUsageDistributionReportService_) {
    DeviceUsageRawService = _DeviceUsageRawService_;
    DeviceUsageDistributionReportService = _DeviceUsageDistributionReportService_;
    $timeout = _$timeout_;
    $q = _$q_;
  }));

  it('add up total usage for a accountId for several day entries', function (done) {
    sinon.stub(DeviceUsageRawService, 'getData');

    var rawData = [
      {
        "accountId": "1111",
        "date": 20161001,
        "totalDuration": 10 * 3600  // seconds
      },
      {
        "accountId": "1111",
        "date": 20161002,
        "totalDuration": 10 * 3600  // seconds
      },
      {
        "accountId": "2222",
        "date": 20161001,
        "totalDuration": 10 * 3600  // seconds
      }
    ];

    DeviceUsageRawService.getData.withArgs(sinon.match.any, sinon.match.any, true).returns($q.when(rawData));

    DeviceUsageDistributionReportService.getDeviceUsageReportData("2000-01-01", "2050-01-01").then(function (data) {
      expect(data.length).toEqual(2);
      expect(data[0].totalDuration).toEqual(20);
      expect(data[1].totalDuration).toEqual(10);
      done();
    });

    $timeout.flush();
  });

});
