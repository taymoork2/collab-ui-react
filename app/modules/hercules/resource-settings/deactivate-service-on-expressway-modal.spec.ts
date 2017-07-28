describe('DeactivateServiceModalView', function () {
  beforeEach(function () {
    this.initModules('Hercules');
    this.injectDependencies('$compile', '$controller', '$templateCache', '$scope', '$q', 'HybridServicesClusterService');

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
});
