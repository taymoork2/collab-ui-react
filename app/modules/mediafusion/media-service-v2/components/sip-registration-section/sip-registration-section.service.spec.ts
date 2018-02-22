import serviceModule from './index';

describe('Service: SipRegistrationSectionService', () => {

  let $httpBackend, $q, HybridServicesClusterService, SipRegistrationSectionService;

  beforeEach(angular.mock.module(serviceModule));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  afterEach(cleanup);

  function dependencies (_$httpBackend_, _$q_, _HybridServicesClusterService_, _SipRegistrationSectionService_) {
    $httpBackend = _$httpBackend_;
    $q = _$q_;
    HybridServicesClusterService = _HybridServicesClusterService_;
    SipRegistrationSectionService = _SipRegistrationSectionService_;
  }

  function cleanup() {
    $httpBackend = $q = HybridServicesClusterService = SipRegistrationSectionService = undefined;
  }

  function initSpies() {
    spyOn(HybridServicesClusterService, 'setProperties').and.returnValue($q.resolve({}));
    spyOn(SipRegistrationSectionService, 'saveSipTrunkUrl').and.returnValue($q.resolve({}));
  }

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('saveSipTrunkUrl', () => {
    it('should save a SIP trunk with the correct data', () => {
      const cluster = {
        id: 'fake-id',
      };
      const sipUrl = 'sip://10.30.60.100';
      SipRegistrationSectionService.saveSipTrunkUrl(sipUrl, cluster.id);
      expect(HybridServicesClusterService.setProperties).toHaveBeenCalledWith(jasmine.objectContaining({
        'mf.ucSipTrunk': sipUrl,
      }), cluster.id);
    });
  });

});
