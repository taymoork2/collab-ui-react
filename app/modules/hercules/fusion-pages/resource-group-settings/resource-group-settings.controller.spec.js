describe('Controller: ResourceGroupSettingsController', function () {
  beforeEach(function () {
    this.initModules('Hercules');
    this.injectDependencies(
      '$controller',
      '$scope',
      '$stateParams',
      'ResourceGroupService',
      'HybridServicesClusterService',
      '$q'
    );

    this.group = { name: 'group_name' };

    spyOn(this.ResourceGroupService, 'get').and.returnValue(this.$q.resolve(this.group));
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

  it('should init as expected', function () {
    expect(this.controller.group).toEqual(this.group);
    expect(this.controller.newGroupName).toEqual(this.group.name);
    expect(this.controller.title).toEqual('hercules.resourceGroupSettings.pageTitle');
    expect(this.controller.titleValues).toEqual = { groupName: this.group.name };
  });
});
