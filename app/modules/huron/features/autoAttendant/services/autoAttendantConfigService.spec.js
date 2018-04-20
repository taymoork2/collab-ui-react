'use strict';


describe('autoAttendantConfigService', function () {
  var autoAttendantConfigService, $httpBackend, HuronConfig, cesPostUrl, csConnString, aaCSOnboardingUrl, Authinfo;

  beforeEach(angular.mock.module('uc.autoattendant'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(inject(function (_$httpBackend_, _HuronConfig_, _AutoAttendantConfigService_, _Authinfo_) {
    Authinfo = _Authinfo_;
    autoAttendantConfigService = _AutoAttendantConfigService_;
    HuronConfig = _HuronConfig_;
    $httpBackend = _$httpBackend_;
    csConnString = 'FakeConnectionString';
    aaCSOnboardingUrl = HuronConfig.getCesUrl() + '/customers/' + Authinfo.getOrgId() + '/config/csOnboardingStatus';
    cesPostUrl = HuronConfig.getCesUrl() + '/cesonboard' + '/customer/' + Authinfo.getOrgId() + '/' + 'contextService';
  }));

  afterEach(function () {
    HuronConfig = null;
    $httpBackend = null;
    Authinfo = null;
  });

  it('should get Chat Config for a given orgId', function () {
    $httpBackend.whenGET(aaCSOnboardingUrl).respond(200);
    autoAttendantConfigService.getCSConfig().then(function (response) {
      expect(response.data.csConnString).toBe(csConnString);
    });
  });

  it('should fail to get Chat Config for a given orgId', function () {
    $httpBackend.whenGET(aaCSOnboardingUrl).respond(500);
    autoAttendantConfigService.getCSConfig().then(function (response) {
      expect(response.status).toBe(500);
    });
  });

  it('should get cs Config POST for a given orgId', function () {
    $httpBackend.whenPOST(cesPostUrl).respond(204);
    autoAttendantConfigService.cesOnboard().then(function (response) {
      expect(response.status).toBe(204);
    });
  });

  it('should fail cs Config POST for a given orgId', function () {
    $httpBackend.whenPOST(cesPostUrl).respond(409);
    autoAttendantConfigService.cesOnboard().then(function (response) {
      expect(response.status).toBe(409);
    });
  });
});
