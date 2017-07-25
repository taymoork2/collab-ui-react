describe('Controller: ExpresswayEndController', function () {
  beforeEach(function () {
    this.initModules('Hercules');
    this.injectDependencies(
      '$controller',
      '$scope',
      '$q',
      '$window',
      '$stateParams'
    );

    spyOn(this.$window, 'open');

    this.hostname = 'hostname';
    this.$stateParams.wizard = {
      state: jasmine.createSpy('state').and.returnValue({
        data: {
          expressway: {
            hostname: this.hostname,
          },
        },
      }),
    };

    this.initController = function () {
      this.controller = this.$controller('ExpresswayEndController', {
        $window: this.$window,
        $stateParams: this.$stateParams,
      });
      this.$scope.$apply();
    };
    this.initController();
  });

  it('should open fusion registration on next', function () {
    expect(this.$stateParams.wizard.state).toHaveBeenCalled();
    this.controller.next();
    expect(this.$window.open).toHaveBeenCalledWith('https://' + encodeURIComponent(this.hostname) + '/fusionregistration');
  });
});
