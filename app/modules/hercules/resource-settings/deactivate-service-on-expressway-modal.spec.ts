import moduleName from './deactivate-service-on-expressway.controller';

describe('DeactivateServiceModalView', function () {
  beforeEach(function () {
    this.initModules(moduleName);
    this.injectDependencies('$compile', '$controller', '$scope', '$q', 'HybridServicesClusterService');

    spyOn(this.HybridServicesClusterService, 'deprovisionConnector').and.returnValue(this.$q.resolve({}));
    spyOn(this.HybridServicesClusterService, 'hasOnlyOneExpresswayWithConnectorProvisioned'); //.and.returnValue(this.$q.resolve(true));

    this.html = require('modules/hercules/resource-settings/deactivate-service-on-expressway-modal.html');
    this.mockModal = { close: jasmine.createSpy('close') };

    this.initComponent = (): void => {
      this.controller = this.$controller('DeactivateServiceOnExpresswayModalController', {
        $modalInstance: this.mockModal,
        HybridServicesClusterService: this.HybridServicesClusterService,
        connectorType: 'connectorType',
        clusterId: 'clusterId',
        clusterName: 'clusterName',
      });
      this.$scope.vm = this.controller;
      this.view = this.$compile(angular.element(this.html))(this.$scope);
      this.$scope.$apply();
    };
  });

  it('should call deactivateService() when Confirm is clicked, with no "I understand" checkbox, when it is not the last connector of its type', function () {
    this.HybridServicesClusterService.hasOnlyOneExpresswayWithConnectorProvisioned.and.returnValue(this.$q.resolve(false));
    this.initComponent();
    spyOn(this.controller, 'deactivateService').and.callThrough();

    this.view.find('#confirm').click();
    this.$scope.$apply();

    expect(this.controller.hasCheckedWarning).toBe(false);
    expect(this.controller.deactivateService).toHaveBeenCalledTimes(1);
    expect(this.mockModal.close).toHaveBeenCalledTimes(1);
  });

  it('should call deactivateService() when Confirm is clicked, after checking "I understand", when it is the last connector of its type', function () {
    this.HybridServicesClusterService.hasOnlyOneExpresswayWithConnectorProvisioned.and.returnValue(this.$q.resolve(true));
    this.initComponent();
    spyOn(this.controller, 'deactivateService').and.callThrough();

    this.view.find('#hasCheckedWarning').click();
    this.view.find('#confirm').click();
    this.$scope.$apply();

    expect(this.controller.hasCheckedWarning).toBe(true);
    expect(this.controller.deactivateService).toHaveBeenCalledTimes(1);
    expect(this.mockModal.close).toHaveBeenCalledTimes(1);
  });

  it('should disable the "Deactivate" button if you do not check "I understand", when it is the last connector of its type', function () {
    this.HybridServicesClusterService.hasOnlyOneExpresswayWithConnectorProvisioned.and.returnValue(this.$q.resolve(true));
    this.initComponent();
    this.$scope.$apply();

    expect(this.view.find('#confirm').attr('disabled')).toBe('disabled');
  });
});
