describe('ClusterDeregisterController', function () {
  beforeEach(function () {
    this.initModules('Hercules');
    this.injectDependencies('$controller', '$q', '$scope', 'PrivateTrunkService', 'HybridServicesClusterService', 'FeatureToggleService');

    spyOn(this.FeatureToggleService, 'atlas2017NameChangeGetStatus').and.returnValue(this.$q.resolve(false));
    spyOn(this.PrivateTrunkService, 'removePrivateTrunkResource').and.returnValue(this.$q.resolve({}));
    spyOn(this.HybridServicesClusterService, 'deregisterCluster').and.returnValue(this.$q.resolve({}));
    this.mockModal = { close: jasmine.createSpy('close') };
    this.baseToggle = {
      id: '123',
      targetType: 'ept',
    };

    this.initController = (cluster: any): void => {
      this.controller = this.$controller('ClusterDeregisterController', {
        $modalInstance: this.mockModal,
        cluster: cluster,
      });
      this.$scope.$apply();
    };
  });

  describe('Enterprise Private Trunking', function () {
    it('should call the correct backend when deleting a private trunk', function () {
      this.initController(this.baseToggle);
      this.controller.deregister();
      this.$scope.$apply();
      expect(this.PrivateTrunkService.removePrivateTrunkResource).toHaveBeenCalled();
      expect(this.HybridServicesClusterService.deregisterCluster).not.toHaveBeenCalled();
      expect(this.mockModal.close).toHaveBeenCalled();
    });
  });

  describe('Hybrid Services', function () {
    it('should call the correct backend when deleting a hybrid media node', function () {
      this.initController({
        id: '456',
        targetType: 'mf_mgmt',
      });
      this.controller.deregister();
      this.$scope.$apply();
      expect(this.PrivateTrunkService.removePrivateTrunkResource).not.toHaveBeenCalled();
      expect(this.HybridServicesClusterService.deregisterCluster).toHaveBeenCalled();
      expect(this.mockModal.close).toHaveBeenCalled();
    });

    it('should call the correct backend when deleting a hybrid data security node', function () {
      this.initController({
        id: '789',
        targetType: 'hds_app',
      });
      this.controller.deregister();
      this.$scope.$apply();
      expect(this.PrivateTrunkService.removePrivateTrunkResource).not.toHaveBeenCalled();
      expect(this.HybridServicesClusterService.deregisterCluster).toHaveBeenCalled();
      expect(this.mockModal.close).toHaveBeenCalled();
    });
  });

  // 2017 name change
  describe('atlas2017NameChangeGetStatus - ', function () {
    it ('nameChangeEnabled should match what atlas2017NameChangeGetStatus returns', function () {
      this.initController(this.baseToggle);
      expect(this.controller.nameChangeEnabled).toBeFalsy();

      this.FeatureToggleService.atlas2017NameChangeGetStatus.and.returnValue(this.$q.resolve(true));
      this.initController(this.baseToggle);
      expect(this.controller.nameChangeEnabled).toBeTruthy();
    });
  });
});
