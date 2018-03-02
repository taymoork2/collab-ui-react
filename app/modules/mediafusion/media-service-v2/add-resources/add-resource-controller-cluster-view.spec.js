'use strict';

describe('AddResourceControllerClusterViewV2', function () {
  beforeEach(function () {
    this.initModules('Mediafusion');
    this.injectDependencies('$controller',
      '$q',
      '$scope',
      '$state',
      '$translate',
      '$window',
      'AddResourceCommonServiceV2',
      'ProPackService'
    );

    this.jsonData = getJSONFixture('mediafusion/json/delete-cluster.json');
    spyOn(this.ProPackService, 'hasProPackPurchased').and.returnValue(this.$q.resolve(false));
    spyOn(this.AddResourceCommonServiceV2, 'addRedirectTargetClicked').and.returnValue(this.$q.resolve({}));
    spyOn(this.AddResourceCommonServiceV2, 'redirectPopUpAndClose');
    spyOn(this.AddResourceCommonServiceV2, 'updateClusterLists').and.returnValue(this.$q.resolve({}));
    spyOn(this.$window, 'open');

    this.mockModal = { dismiss: jasmine.createSpy('dismiss') };

    this.$state.params = {
      wizard: {},
      firstTimeSetup: false,
      yesProceed: true,
      fromClusters: true,
    };

    this.initController = function () {
      this.controller = this.$controller('AddResourceControllerClusterViewV2', {
        $q: this.$q,
        $translate: this.$translate,
        $state: this.$state,
        AddResourceCommonServiceV2: this.AddResourceCommonServiceV2,
        ProPackService: this.ProPackService,
        $modalInstance: this.mockModal,
      });
      this.$scope.$apply();
    };
    this.initController();
  });

  it('AddResourceCommonServiceV2.redirectPopUpAndClose should be called for redirectToTargetAndCloseWindowClicked', function () {
    this.controller.redirectToTargetAndCloseWindowClicked();
    this.$scope.$apply();
    expect(this.AddResourceCommonServiceV2.addRedirectTargetClicked).toHaveBeenCalled();
    expect(this.AddResourceCommonServiceV2.redirectPopUpAndClose).toHaveBeenCalled();
  });

  it('controller.enableRedirectToTarget should be true for next', function () {
    this.controller.selectedCluster = 'selectedCluster';
    this.controller.hostName = 'hostName';
    this.controller.next();
    expect(this.controller.enableRedirectToTarget).toBe(true);
  });

  it('AddResourceControllerClusterViewV2 canGoNext should disable the next button when the feild is empty', function () {
    this.controller.hosts = [this.jsonData.hosts];
    this.controller.canGoNext();
    expect(this.controller.canGoNext()).toBeFalsy();
  });

  it('AddResourceControllerClusterViewV2 canGoNext should enable the next button when firstTimeSetup is true and yesProceed is false', function () {
    this.controller.firstTimeSetup = true;
    this.controller.yesProceed = false;
    this.controller.canGoNext();
    expect(this.controller.canGoNext()).toBeTruthy();
  });

  it('AddResourceControllerClusterViewV2 canGoNext should enable the next button when the feild is filled', function () {
    this.controller.firstTimeSetup = true;
    this.controller.yesProceed = true;
    this.controller.hostName = 'sampleHost';
    this.controller.selectedCluster = 'sampleCluster';
    this.controller.canGoNext();
    expect(this.controller.canGoNext()).toBeTruthy();
  });

  it('controller.enableRedirectToTarget should be true for next()', function () {
    this.controller.selectedCluster = 'selectedCluster';
    this.controller.hostName = 'hostName';
    this.controller.next();
    expect(this.controller.enableRedirectToTarget).toBe(true);
  });

  it('controller.noProceed should be true for next()', function () {
    this.controller.radio = '0';
    this.controller.noProceed = false;
    this.controller.next();
    expect(this.controller.noProceed).toBe(true);
  });

  // 2017 name change
  describe('atlasProPackGetStatus - ', function () {
    it('getAppTitle should return pro name if ProPackService is true', function () {
      expect(this.controller.getAppTitle()).toEqual('loginPage.titleNew');

      this.ProPackService.hasProPackPurchased.and.returnValue(this.$q.resolve(true));
      this.initController();
      expect(this.controller.getAppTitle()).toEqual('loginPage.titlePro');
    });
  });
});
