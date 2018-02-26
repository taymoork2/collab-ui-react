import TrustedSipModule from './index';

describe('TrustedSipSectionService', function () {
  beforeEach(function () {
    this.initModules(TrustedSipModule);
    this.injectDependencies(
      '$httpBackend',
      '$q',
      'TrustedSipSectionService',
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

  describe('saveSipConfigurations', function () {
    it('should save a list of trusted SIP sources with the correct data', function () {
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
