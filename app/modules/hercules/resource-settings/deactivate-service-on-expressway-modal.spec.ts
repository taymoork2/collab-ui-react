describe('DeactivateServiceModalView', function () {
  beforeEach(function () {
    this.initModules('Hercules');
    this.injectDependencies('$compile', '$controller', '$templateCache', '$scope', '$q', 'HybridServicesClusterService', 'FeatureToggleService');

    spyOn(this.FeatureToggleService, 'atlas2017NameChangeGetStatus').and.returnValue(this.$q.resolve(false));
    spyOn(this.HybridServicesClusterService, 'deprovisionConnector').and.returnValue(this.$q.resolve({}));

    this.html = this.$templateCache.get('modules/hercules/resource-settings/deactivate-service-on-expressway-modal.html');
    this.mockModal = { close: jasmine.createSpy('close') };

    this.initComponent = (): void => {
      this.controller = this.$controller('DeactivateServiceOnExpresswayModalController', {
        $modalInstance: this.mockModal,
        HybridServicesClusterService: this.HybridServicesClusterService,
        FeatureToggleService: this.FeatureToggleService,
        serviceId: 'serviceId',
        clusterId: 'clusterId',
        clusterName: 'clusterName',
      });
      this.$scope.deactivateServiceOnExpresswayModal = this.controller;
      this.view = this.$compile(angular.element(this.html))(this.$scope);
      this.$scope.$apply();
    };
  });

  it('should call deactivateService() when Confirm is clicked', function () {
    this.initComponent();
    spyOn(this.controller, 'deactivateService').and.callThrough();
    this.view.find('#confirm').click();
    this.$scope.$apply();
    expect(this.controller.deactivateService).toHaveBeenCalledTimes(1);
    expect(this.mockModal.close).toHaveBeenCalledTimes(1);
  });

  // 2017 name change
  it('should display base name when atlas2017NameChangeGetStatus returns false', function () {
    this.initComponent();
    expect(this.view.text()).toContain('hercules.deactivateServiceSingleCluster.notDeregistered');
    expect(this.view.text()).not.toContain('hercules.deactivateServiceSingleCluster.notDeregisteredNew');
    expect(this.controller.nameChangeEnabled).toBeFalsy();
  });

  it('should display new name when atlas2017NameChangeGetStatus returns true', function () {
    this.FeatureToggleService.atlas2017NameChangeGetStatus.and.returnValue(this.$q.resolve(true));
    this.initComponent();
    expect(this.view.text()).toContain('hercules.deactivateServiceSingleCluster.notDeregisteredNew');
    expect(this.controller.nameChangeEnabled).toBeTruthy();
  });
});
