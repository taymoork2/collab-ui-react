'use strict';

describe('emailService', function () {
  beforeEach(angular.mock.module('Core'));

  var $httpBackend, UrlConfig, EmailService, LogMetricsService;

  beforeEach(inject(function (_$httpBackend_, _UrlConfig_, _EmailService_, _LogMetricsService_) {
    $httpBackend = _$httpBackend_;
    UrlConfig = _UrlConfig_;
    EmailService = _EmailService_;
    LogMetricsService = _LogMetricsService_;

    spyOn(LogMetricsService, 'logMetrics');
    spyOn(LogMetricsService, 'getEventType');
  }));

  it('should report success when URL is posted', function () {
    $httpBackend.whenPOST(UrlConfig.getAdminServiceUrl() + 'email').respond(200);
    EmailService.emailNotifyTrialCustomer('flast@company.com', '90', '0000000000000001');
    $httpBackend.flush();
    expect(LogMetricsService.logMetrics.calls.count()).toEqual(1);
    var type = LogMetricsService.getEventType.calls.argsFor(0)[0].split(' ');
    expect(type).toContain('(success)');
  });

  it('should report error when URL is posted', function () {
    $httpBackend.whenPOST(UrlConfig.getAdminServiceUrl() + 'email').respond(500);
    EmailService.emailNotifyTrialCustomer('flast@company.com', '90', '0000000000000001');
    $httpBackend.flush();
    expect(LogMetricsService.logMetrics.calls.count()).toEqual(1);
    var type = LogMetricsService.getEventType.calls.argsFor(0)[0].split(' ');
    expect(type).toContain('(error)');
  });

  describe('helper functions:', function () {
    describe('mkTrialPayload()', function () {
      it('returns a custom-formed object composed from the args', function () {
        var mkTrialPayload = EmailService._helpers.mkTrialPayload,
          fakeCustEmail = 'fake-customer-admin@example.com',
          fakeTrialPeriod = 90,
          fakeOrgId = 'fake-uuid-val-1',
          CUSTOMER_TRIAL = EmailService._types.CUSTOMER_TRIAL;

        expect(mkTrialPayload(fakeCustEmail, fakeTrialPeriod, fakeOrgId)).toEqual({
          type: CUSTOMER_TRIAL,
          addressTo: fakeCustEmail,
          properties: {
            CustomerEmail: fakeCustEmail,
            TrialPeriod: fakeTrialPeriod,
            OrganizationId: fakeOrgId
          }
        });
      });
    });
  });
});
