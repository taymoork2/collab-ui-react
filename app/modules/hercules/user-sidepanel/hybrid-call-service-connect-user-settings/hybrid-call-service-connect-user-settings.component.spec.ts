import hybridCallServiceConnectUserSettingsModuleName from './index';

describe('hybridCallServiceConnectUserSettings', () => {

  let $componentController, $q, $scope, ctrl, HybridServiceUserSidepanelHelperService, UserOverviewService;

  beforeEach(function () {
    this.initModules(hybridCallServiceConnectUserSettingsModuleName);
  });

  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  afterEach(cleanup);

  function dependencies (_$componentController_, _$q_, $rootScope, _HybridServiceUserSidepanelHelperService_, _UserOverviewService_) {
    $componentController = _$componentController_;
    $q = _$q_;
    $scope = $rootScope;
    HybridServiceUserSidepanelHelperService = _HybridServiceUserSidepanelHelperService_;
    UserOverviewService = _UserOverviewService_;
  }

  function cleanup() {
    $componentController = ctrl = $scope = HybridServiceUserSidepanelHelperService = UserOverviewService = undefined;
  }

  function initSpies() {
    spyOn(HybridServiceUserSidepanelHelperService, 'getDataFromUSS').and.returnValue($q.resolve([{}, {}]));
    spyOn(HybridServiceUserSidepanelHelperService, 'saveUserEntitlements').and.returnValue($q.resolve({}));
    spyOn(UserOverviewService, 'getUser');
  }

  function initController() {
    ctrl = $componentController('hybridCallServiceConnectUserSettings', {}, {
      userId: '1234',
      userEmailAddress: 'test@example.org',
    });
    ctrl.$onInit();
    $scope.$apply();
  }

  it('should read the Connect status and update internal entitlement data when user is *not* entitled', () => {
    UserOverviewService.getUser.and.returnValue($q.resolve({
      user: {
        entitlements: ['squared-fusion-uc'],
      },
    }));
    initController();
    expect(HybridServiceUserSidepanelHelperService.getDataFromUSS.calls.count()).toBe(1);
    expect(ctrl.userIsCurrentlyEntitled).toBe(false);
  });

  it('should read the Connect status and update internal entitlement data when user is entitled', () => {
    UserOverviewService.getUser.and.returnValue($q.resolve({
      user: {
        entitlements: ['squared-fusion-uc', 'squared-fusion-ec'],
      },
    }));
    initController();
    $scope.$apply();
    expect(ctrl.userIsCurrentlyEntitled).toBe(true);
  });

  it('should not remove Aware when removing Connect', () => {
    UserOverviewService.getUser.and.returnValue($q.resolve({
      user: {
        entitlements: ['squared-fusion-uc', 'squared-fusion-ec'],
      },
    }));
    const expectedEntitlements = [{
      entitlementName: 'squaredFusionUC',
      entitlementState: 'ACTIVE',
    }, {
      entitlementName: 'squaredFusionEC',
      entitlementState: 'INACTIVE',
    }];
    initController();

    ctrl.newEntitlementValue = false;
    ctrl.saveData();

    expect(HybridServiceUserSidepanelHelperService.saveUserEntitlements).toHaveBeenCalledWith('1234', 'test@example.org', expectedEntitlements);
  });

  it('should on save call the callback, after waiting a bit and probing USS for fresh data', () => {
    UserOverviewService.getUser.and.returnValue($q.resolve({
      user: {
        entitlements: [],
      },
    }));
    initController();

    ctrl.newEntitlementValue = true;
    ctrl.saveData();
    $scope.$apply();

    expect(HybridServiceUserSidepanelHelperService.getDataFromUSS.calls.count()).toBe(2);

  });

});
