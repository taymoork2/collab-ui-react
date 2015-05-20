'use strict';

describe('emailService', function () {
  beforeEach(module('Core'));

  var $httpBackend, Config, EmailService, LogMetricsService;

  beforeEach(inject(function (_$httpBackend_, _Config_, _EmailService_, _LogMetricsService_) {
    $httpBackend = _$httpBackend_;
    Config = _Config_;
    EmailService = _EmailService_;
    LogMetricsService = _LogMetricsService_;

    spyOn(LogMetricsService, 'logMetrics');
    spyOn(LogMetricsService, 'getEventType');
  }));

  it('should report success when URL is posted', function () {
    $httpBackend.whenPOST(Config.getAdminServiceUrl() + 'email').respond(200);
    EmailService.emailNotifyTrialCustomer('flast@company.com', '90', '0000000000000001');
    $httpBackend.flush();
    expect(LogMetricsService.logMetrics.calls.count()).toEqual(1);
    var type = LogMetricsService.getEventType.calls.argsFor(0)[0].split(' ');
    expect(type).toContain('(success)');
  });

  it('should report error when URL is posted', function () {
    $httpBackend.whenPOST(Config.getAdminServiceUrl() + 'email').respond(500);
    EmailService.emailNotifyTrialCustomer('flast@company.com', '90', '0000000000000001');
    $httpBackend.flush();
    expect(LogMetricsService.logMetrics.calls.count()).toEqual(1);
    var type = LogMetricsService.getEventType.calls.argsFor(0)[0].split(' ');
    expect(type).toContain('(error)');
  });

});
