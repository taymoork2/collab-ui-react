describe('Controller: HDSRedirectAddResourceController', function () {
  beforeEach(function () {
    this.initModules('HDS');
    this.injectDependencies(
      '$controller',
      '$scope',
      '$q',
      'FeatureToggleService',
      'HDSAddResourceCommonService',
      'ITProPackService'
    );

    spyOn(this.FeatureToggleService, 'atlas2017NameChangeGetStatus').and.returnValue(this.$q.resolve(false));
    spyOn(this.ITProPackService, 'hasITProPackPurchased').and.returnValue(this.$q.resolve(false));
    spyOn(this.HDSAddResourceCommonService, 'updateClusterLists').and.returnValue(this.$q.resolve([]));

    this.mockModal = { dismiss: jasmine.createSpy('dismiss') };

    this.initController = function () {
      this.controller = this.$controller('HDSRedirectAddResourceController', {
        $modalInstance: this.mockModal,
        FeatureToggleService: this.FeatureToggleService,
        firstTimeSetup: false,
        ITProPackService: this.ITProPackService,
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

  it('getAppTitle should return new or pro Atlas name based on hasITProPackPurchased', function () {
    expect(this.controller.getAppTitle()).toEqual('loginPage.titleNew');

    this.ITProPackService.hasITProPackPurchased.and.returnValue(this.$q.resolve(true));
    this.initController();
    expect(this.controller.getAppTitle()).toEqual('loginPage.titlePro');
  });
});
