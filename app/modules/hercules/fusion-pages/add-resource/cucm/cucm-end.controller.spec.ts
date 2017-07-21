describe('Controller: CucmEndController', function () {
  beforeEach(function () {
    this.initModules('Hercules');
    this.injectDependencies(
      '$controller',
      '$scope',
      '$q',
      '$window',
      '$stateParams',
    );

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
});
