describe('Service: CertService', () => {
  let  CertService, $httpBackend: any, UrlConfig: any, $q: ng.IQService;
  const fakeOrgId = '555-6677';
  beforeEach(angular.mock.module('Hercules'));
  beforeEach(angular.mock.module(mockDependencies));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);

  function dependencies (_CertService_, _$httpBackend_, _UrlConfig_,  _$q_): void {
    CertService = _CertService_;
    $httpBackend = _$httpBackend_;
    $q = _$q_;
    UrlConfig = _UrlConfig_;
  }

  function initSpies(): void {
    spyOn(CertService, 'uploadCert').and.returnValue($q.resolve(true));

  }
  function mockDependencies($provide) {
    const Authinfo = {
      getOrgId: jasmine.createSpy('getOrgId').and.returnValue(fakeOrgId),
    };
    $provide.value('Authinfo', Authinfo);
  }

  afterEach( () => {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('getCerts', () => {
    it('should call the right backend', () => {
      const CertsUrl = UrlConfig.getCertsUrl() + 'certificate/api/v1';
      const orgId = '0FF1C3';
      $httpBackend.expectGET(`${CertsUrl}/certificates?expand=decoded&orgId=0FF1C3`).respond([]);
      CertService.getCerts(orgId);
      $httpBackend.flush();
    });
  });

  describe ('deleteCert', () => {
    it('should call the right backend using the provided orgIg', () => {
      const CertsUrl = UrlConfig.getCertsUrl() + 'certificate/api/v1';
      const certId = '0-1-2-3-4-5';
      const orgId = '1983';
      $httpBackend.expectDELETE(`${CertsUrl}/certificates/${certId}?orgId=${orgId}`).respond([]);
      CertService.deleteCert(certId, orgId);
      $httpBackend.flush();
    });

    it("should call the right backend and fall back to the customer's orgId if none is provided", () => {
      const CertsUrl = UrlConfig.getCertsUrl() + 'certificate/api/v1';
      const certId = '0-1-2-3-4-5';
      $httpBackend.expectDELETE(`${CertsUrl}/certificates/${certId}?orgId=${fakeOrgId}`).respond([]);
      CertService.deleteCert(certId);
      $httpBackend.flush();
    });
  });

  describe('uploadCert', () => {
    it('uploadCert should call the right backend', () => {
      const file = '0-1-2-3-4-5';
      const orgId = '0FF1C3';
      CertService.uploadCert(orgId, file);
      expect(CertService.uploadCert).toHaveBeenCalledWith(orgId, file);
    });
  });

});
