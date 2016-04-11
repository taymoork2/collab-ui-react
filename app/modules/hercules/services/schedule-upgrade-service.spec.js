'use strict';

describe('Service: Schedule Upgrade', function () {
  beforeEach(module('Hercules'));

  var $httpBackend, ScheduleUpgradeService;

  beforeEach(inject(function (_$httpBackend_, _ScheduleUpgradeService_) {
    $httpBackend = _$httpBackend_;
    ScheduleUpgradeService = _ScheduleUpgradeService_;
  }));

  afterEach(function () {
    $httpBackend.flush();
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('ScheduleUpgradeService.get should query the server with the right params', function () {
    $httpBackend.expectGET('https://hercules-integration.wbx2.com/v1/organizations/123/services/c_cal/upgrade_schedule').respond({});
    ScheduleUpgradeService.get('123', 'c_cal');
  });

  it('ScheduleUpgradeService.path should query the server with the right params', function () {
    $httpBackend.expectPATCH('https://hercules-integration.wbx2.com/v1/organizations/123/services/c_cal/upgrade_schedule', {
      a: 'b'
    }).respond({});
    ScheduleUpgradeService.patch('123', 'c_cal', {
      a: 'b'
    });
  });
});
