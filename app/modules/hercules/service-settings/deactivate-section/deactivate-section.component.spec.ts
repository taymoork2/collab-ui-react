import deactivateSection from './deactivate-section.component';

describe('Component: DeactivateSection ', function () {
  beforeEach(function () {
    this.initModules(deactivateSection);
    this.injectDependencies('$componentController', '$q', '$state', '$scope');

    spyOn(this.$state, 'go');

    this.MockModalService = {
      open: jasmine.createSpy('open').and.returnValue({
        result: this.$q.resolve(true),
      }),
    };

    this.initController = (): void => {
      this.controller = this.$componentController('deactivateSection', {
        $modal: this.MockModalService,
        $state: this.$state,
      });
      this.controller.$onInit();
      this.$scope.$apply();
    };
    this.initController();
  });

  it('redirects to the services overview page when the admin has confirmed deletion', function () {
    this.controller.confirmDisable();
    this.$scope.$apply();
    expect(this.$state.go).toHaveBeenCalledWith('services-overview');
    expect(this.MockModalService.open).toHaveBeenCalled();
  });
});
