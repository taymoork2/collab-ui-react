'use strict';


describe('autoAttendantConfigService', function () {
  var autoAttendantConfigService, $httpBackend, HuronConfig, csConnString, aaCSOnboardingUrl, Authinfo;

  beforeEach(angular.mock.module('uc.autoattendant'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(inject(function (_$httpBackend_, _HuronConfig_, _AutoAttendantConfigService_, _Authinfo_) {
    Authinfo = _Authinfo_;
    autoAttendantConfigService = _AutoAttendantConfigService_;
    HuronConfig = _HuronConfig_;
    $httpBackend = _$httpBackend_;
    csConnString = 'FakeConnectionString';
    aaCSOnboardingUrl = HuronConfig.getCesUrl() + '/customers/' + Authinfo.getOrgId() + '/config/csOnboardingStatus';
  }));

  afterEach(function () {
    HuronConfig = null;
    $httpBackend = null;
    Authinfo = null;
  });

  it('should get Chat Config for a give orgId', function () {
    $httpBackend.whenGET(aaCSOnboardingUrl).respond(200);
    autoAttendantConfigService.getCSConfig().then(function (response) {
      expect(response.data.csConnString).toBe(csConnString);
    });
  });

  it('should fail to get Chat Config for a give orgId', function () {
    $httpBackend.whenGET(aaCSOnboardingUrl).respond(500);
    autoAttendantConfigService.getCSConfig().then(function (response) {
      expect(response.status).toBe(500);
    });
  });
});

