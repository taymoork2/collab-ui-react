import ModuleName from './index';

describe('Service: ClusterCascadeBandwidthService', () => {
  beforeEach(function () {
    this.initModules(ModuleName);
    this.injectDependencies(
      '$httpBackend',
      '$q',
      'ClusterCascadeBandwidthService',
      'HybridServicesClusterService',
    );
    spyOn(this.HybridServicesClusterService, 'setProperties').and.returnValue(this.$q.resolve({}));
  });
  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  describe('check functionality of saveCascadeConfig', function () {
    it('should save cluster casecde bandwidth with the correct data', function () {
      const cluster = {
        id: 'fake-id',
      };
      const cascadeBandwidthConfiguration = 43;
      this.ClusterCascadeBandwidthService.saveCascadeConfig(cluster.id, cascadeBandwidthConfiguration);
      expect(this.HybridServicesClusterService.setProperties).toHaveBeenCalledWith(cluster.id, jasmine.objectContaining({
        'mf.maxCascadeBandwidth': cascadeBandwidthConfiguration,
      }));
    });

  });
});
