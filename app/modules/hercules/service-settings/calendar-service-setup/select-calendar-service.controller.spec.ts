describe('Controller: SelectCalendarServiceController ', function () {
  beforeEach(function () {
    this.initModules('Hercules');
    this.injectDependencies('$controller', '$scope');

    this.MockModal = {
      close: jasmine.createSpy('close'),
    };

    this.initController = (): void => {
      this.controller = this.$controller('SelectCalendarServiceController', {
        $modalInstance: this.MockModal,
        FeatureToggleService: this.FeatureToggleService,
      });
      this.$scope.$apply();
    };
    this.initController();
  });

  it('should call modalInstance.close on proceed()', function () {
    this.controller.proceed();
    expect(this.MockModal.close).toHaveBeenCalled();
  });
});
