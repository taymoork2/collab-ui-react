describe('Controller: MediafusionEnterHostnameController', function () {
  beforeEach(function () {
    this.initModules('Hercules');
    this.injectDependencies('$controller', '$scope');

    this.initController = function () {
      this.controller = this.$controller('MediafusionEnterHostnameController', {
        FeatureToggleService: this.FeatureToggleService,
      });
      this.$scope.$apply();
    };
    this.initController();
  });

  // 2017 name change
  it('hostname must have more than three characters to be valid', function () {
    expect(this.controller.canGoNext()).toBeFalsy();
    this.controller.hostname = 'hostname';
    expect(this.controller.canGoNext()).toBeTruthy();
  });
});
