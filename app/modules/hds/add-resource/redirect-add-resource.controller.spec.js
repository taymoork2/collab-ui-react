describe('Controller: HDSRedirectAddResourceController', function () {
  beforeEach(function () {
    this.initModules('HDS');
    this.injectDependencies(
      '$controller',
      '$scope',
      '$q',
      'FeatureToggleService',
      'HDSAddResourceCommonService',
      'ProPackService'
    );

    spyOn(this.FeatureToggleService, 'atlas2017NameChangeGetStatus').and.returnValue(this.$q.resolve(false));
    spyOn(this.ProPackService, 'hasProPackPurchased').and.returnValue(this.$q.resolve(false));
    spyOn(this.HDSAddResourceCommonService, 'updateClusterLists').and.returnValue(this.$q.resolve([]));

    this.mockModal = { dismiss: jasmine.createSpy('dismiss') };

    this.initController = function () {
      this.controller = this.$controller('HDSRedirectAddResourceController', {
        $modalInstance: this.mockModal,
        FeatureToggleService: this.FeatureToggleService,
        firstTimeSetup: false,
        ProPackService: this.ProPackService,
      });
      this.$scope.$apply();
    };
    this.initController();
  });

  // 2017 name change
  it('nameChangeEnabled should depend on atlas2017NameChangeGetStatus', function () {
    expect(this.controller.nameChangeEnabled).toBeFalsy();

    this.FeatureToggleService.atlas2017NameChangeGetStatus.and.returnValue(this.$q.resolve(true));
    this.initController();
    expect(this.controller.nameChangeEnabled).toBeTruthy();
  });

  it('getAppTitle should return new or pro Atlas name based on hasProPackPurchased', function () {
    expect(this.controller.getAppTitle()).toEqual('loginPage.titleNew');

    this.ProPackService.hasProPackPurchased.and.returnValue(this.$q.resolve(true));
    this.initController();
    expect(this.controller.getAppTitle()).toEqual('loginPage.titlePro');
  });
});
