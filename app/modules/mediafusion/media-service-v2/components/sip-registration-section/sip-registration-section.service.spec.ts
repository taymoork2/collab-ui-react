import SipRegistrationModule from './index';

describe('SipRegistrationSectionService', function () {
  beforeEach(function () {
    this.initModules(SipRegistrationModule);
    this.injectDependencies(
      '$httpBackend',
      '$q',
      'SipRegistrationSectionService',
      'HybridServicesClusterService',
      'Notification',
    );
    spyOn(this.Notification, 'error');
    spyOn(this.Notification, 'errorWithTrackingId');
    spyOn(this.HybridServicesClusterService, 'setProperties').and.returnValue(this.$q.resolve({}));
  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  describe('saveSipTrunkUrl', function () {
    it('should save a SIP trunk with the correct data', function () {
      const cluster = {
        id: 'fake-id',
      };
      const sipUrl = 'sip://10.30.60.100';
      this.SipRegistrationSectionService.saveSipTrunkUrl(sipUrl, cluster.id);
      expect(this.HybridServicesClusterService.setProperties).toHaveBeenCalledWith(cluster.id, jasmine.objectContaining({
        'mf.ucSipTrunk': sipUrl,
      }));
    });
  });

});
