describe('Controller: SelectCalendarServiceController ', function () {
  beforeEach(function () {
    this.initModules('Hercules');
    this.injectDependencies('$controller', '$scope', '$q', 'FeatureToggleService');

    spyOn(this.FeatureToggleService, 'atlas2017NameChangeGetStatus').and.returnValue(this.$q.resolve(false));

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

  // 2017 name change
  it('nameChangeEnabled should match the return value of atlas2017NameChangeGetStatus', function () {
    expect(this.controller.nameChangeEnabled).toBeFalsy();

    this.FeatureToggleService.atlas2017NameChangeGetStatus.and.returnValue(this.$q.resolve(true));
    this.initController();
    expect(this.controller.nameChangeEnabled).toBeTruthy();
  });
});
