describe('Controller: ResourceGroupSettingsController', function () {
  beforeEach(function () {
    this.initModules('Hercules');
    this.injectDependencies(
      '$controller',
      '$scope',
      '$stateParams',
      'ResourceGroupService',
      'HybridServicesClusterService',
      '$q',
      'FeatureToggleService'
    );

    spyOn(this.FeatureToggleService, 'atlas2017NameChangeGetStatus').and.returnValue(this.$q.resolve(false));
    spyOn(this.ResourceGroupService, 'get').and.returnValue(this.$q.resolve({ name: 'group_name' }));
    spyOn(this.HybridServicesClusterService, 'getAll').and.returnValue(this.$q.resolve([]));
    this.$stateParams.id = 'mock_id';

    this.initController = function () {
      this.controller = this.$controller('ResourceGroupSettingsController', {
        $stateParams: this.$stateParams,
        FeatureToggleService: this.FeatureToggleService,
        HybridServicesClusterService: this.HybridServicesClusterService,
        ResourceGroupService: this.ResourceGroupService,
      });
      this.$scope.$apply();
    };
    this.initController();
  });

  // 2017 name change
  it('new name usage should depend on atlas2017NameChangeGetStatus', function () {
    expect(this.controller.nameChangeEnabled).toBeFalsy();

    this.FeatureToggleService.atlas2017NameChangeGetStatus.and.returnValue(this.$q.resolve(true));
    this.initController();
    expect(this.controller.nameChangeEnabled).toBeTruthy();
  });
});
