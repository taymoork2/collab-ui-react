describe('Service: CertService', () => {
  let  CertService, $httpBackend: any, UrlConfig: any, $q: ng.IQService, $scope;
  beforeEach(angular.mock.module('Hercules'));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);

  function dependencies (_CertService_, _$httpBackend_, _UrlConfig_,  _$q_, _$rootScope_): void {
    CertService = _CertService_;
    $httpBackend = _$httpBackend_;
    $q = _$q_;
    UrlConfig = _UrlConfig_;
    $scope = _$rootScope_.$new();
  }

  function initSpies(): void {
    spyOn(CertService, 'uploadCert').and.returnValue($q.resolve(true));
  }

  afterEach( () => {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('getCerts should call the right backend', () => {
    let CertsUrl = UrlConfig.getCertsUrl() + 'certificate/api/v1';
    let orgId = '0FF1C3';
    $httpBackend.expectGET(`${CertsUrl}/certificates?expand=decoded&orgId=0FF1C3`).respond([]);
    CertService.getCerts(orgId);
    $httpBackend.flush();
  });

  it('deleteCert should call the right backend', () => {
    let CertsUrl = UrlConfig.getCertsUrl() + 'certificate/api/v1';
    let certId = '0-1-2-3-4-5';
    $httpBackend.expectDELETE(`${CertsUrl}/certificates/0-1-2-3-4-5`).respond([]);
    CertService.deleteCert(certId);
    $httpBackend.flush();
  });
  it('uploadCert should call the right backend', () => {
    let file = '0-1-2-3-4-5';
    let orgId = '0FF1C3';
    CertService.uploadCert(orgId, file);
    expect(CertService.uploadCert).toHaveBeenCalledWith(orgId, file);
  });

});
