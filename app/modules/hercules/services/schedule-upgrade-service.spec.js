'use strict';

describe('Service: Schedule Upgrade', function () {
  beforeEach(module('wx2AdminWebClientApp'));

  var $httpBackend, ScheduleUpgradeService;

  beforeEach(inject(function (_$httpBackend_, _ScheduleUpgradeService_) {
    $httpBackend = _$httpBackend_;
    ScheduleUpgradeService = _ScheduleUpgradeService_;

    $httpBackend
      .when('GET', 'l10n/en_US.json')
      .respond({});
  }));

  afterEach(function () {
    $httpBackend.flush();
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('ScheduleUpgradeService.get should query the server with the right params', function () {
    $httpBackend.expectGET('https://uss-integration.wbx2.com/uss/api/v1/organizations/123/services/c_cal/upgrade_schedule').respond({});
    ScheduleUpgradeService.get('123', 'c_cal');
  });

  it('ScheduleUpgradeService.path should query the server with the right params', function () {
    $httpBackend.expectPATCH('https://uss-integration.wbx2.com/uss/api/v1/organizations/123/services/c_cal/upgrade_schedule', {
      scheduleTime: '03:00',
      scheduleDay: 4,
      scheduleTimezone: 'Europe/Paris'
    }).respond({});
    ScheduleUpgradeService.patch('123', 'c_cal', {
      scheduleTime: '03:00',
      scheduleDay: 4,
      scheduleTimezone: 'Europe/Paris'
    });
  });
});
