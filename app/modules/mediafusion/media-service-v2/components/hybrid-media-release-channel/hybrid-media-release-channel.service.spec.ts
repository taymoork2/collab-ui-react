import ModuleName from './index';

describe('Service: HybridMediaReleaseChannelService', function () {
  beforeEach(function () {
    this.initModules(ModuleName);
    this.injectDependencies(
      '$httpBackend',
      '$q',
      'HybridMediaReleaseChannelService',
      'HybridServicesClusterService',
    );
    spyOn(this.HybridServicesClusterService, 'setClusterInformation').and.returnValue(this.$q.resolve({}));
  });
  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  describe('saveReleaseChannel()', function () {
    it('should save release channel with the correct data', function () {
      const cluster = {
        id: 'sample-id',
      };
      const releaseChannelSelected = {
        label: 'Stable',
        value: 'stable',
      };
      this.HybridMediaReleaseChannelService.saveReleaseChannel(cluster.id, releaseChannelSelected);
      expect(this.HybridServicesClusterService.setClusterInformation).toHaveBeenCalledWith(cluster.id, jasmine.objectContaining({
        releaseChannel: 'stable',
      }));
    });

  });
});
