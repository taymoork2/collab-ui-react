import TrustedSipModule from './index';

describe('TrustedSipSectionService', () => {
  beforeEach(function () {
    this.initModules(TrustedSipModule);
    this.injectDependencies(
      '$httpBackend',
      'TrustedSipSectionService',
      'HybridServicesClusterService',
      'Notification',
    );
    spyOn(this.Notification, 'error');
    spyOn(this.Notification, 'errorWithTrackingId');
    spyOn(this.HybridServicesClusterService, 'setProperties');
  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  describe('saveSipConfigurations', () => {
    it('should save a list of trusted SIP sources with the correct data', () => {
      const cluster = {
        id: 'fake-id',
      };
      const source1 = 'registrar.example.org';
      const source2 = 'proxy.example.org';
      const sipSources = [{
        text: source1,
      }, {
        text: source2,
      }];
      this.TrustedSipSectionService.saveSipConfigurations(sipSources, cluster.id);
      expect(this.HybridServicesClusterService.setProperties).toHaveBeenCalledWith(cluster.id, jasmine.objectContaining({
        'mf.trustedSipSources': `${source1}, ${source2}`,
      }));
    });
  });

});
