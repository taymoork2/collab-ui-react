describe('Controller: CucmEndController', function () {
  beforeEach(function () {
    this.initModules('Hercules');
    this.injectDependencies(
      '$controller',
      '$scope',
      '$q',
      '$window',
      '$stateParams',
      'FeatureToggleService',
    );

    spyOn(this.FeatureToggleService, 'atlas2017NameChangeGetStatus').and.returnValue(this.$q.resolve(false));
    spyOn(this.$window, 'open');

    this.hostname = 'hostname';
    this.$stateParams.wizard = {
      state: jasmine.createSpy('state').and.returnValue({
        data: {
          cucm: {
            hostname: this.hostname,
          },
        },
      }),
    };

    this.initController = (): void => {
      this.controller = this.$controller('CucmEndController', {
        $window: this.$window,
        $stateParams: this.$stateParams,
        FeatureToggleService: this.FeatureToggleService,
      });
      this.$scope.$apply();
    };
    this.initController();
  });

  it('should open fusion registration on next', function () {
    this.controller.next();
    expect(this.$stateParams.wizard.state).toHaveBeenCalled();
    expect(this.$window.open).toHaveBeenCalledWith('https://' + encodeURIComponent(this.hostname) + '/ccmadmin/fusionRegistration.do');
  });

  // 2017 name change
  it('new name usage should depend on atlas2017NameChangeGetStatus', function () {
    expect(this.controller.nameChangeEnabled).toBeFalsy();

    this.FeatureToggleService.atlas2017NameChangeGetStatus.and.returnValue(this.$q.resolve(true));
    this.initController();
    expect(this.controller.nameChangeEnabled).toBeTruthy();
  });
});
