import hybridCallServiceConnectUserSettingsModuleName from './index';

describe('hybridCallServiceConnectUserSettings', () => {

  let $componentController, $q, $scope, ctrl, HybridServiceUserSidepanelHelperService;

  beforeEach(function () {
    this.initModules(hybridCallServiceConnectUserSettingsModuleName);
  });

  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  afterEach(cleanup);

  function dependencies (_$componentController_, _$q_, $rootScope, _HybridServiceUserSidepanelHelperService_) {
    $componentController = _$componentController_;
    $q = _$q_;
    $scope = $rootScope;
    HybridServiceUserSidepanelHelperService = _HybridServiceUserSidepanelHelperService_;
  }

  function cleanup() {
    $componentController = ctrl = $scope = HybridServiceUserSidepanelHelperService = undefined;
  }

  function initSpies() {
    spyOn(HybridServiceUserSidepanelHelperService, 'getDataFromUSS').and.returnValue($q.resolve([{}, {}]));
    spyOn(HybridServiceUserSidepanelHelperService, 'saveUserEntitlements').and.returnValue($q.resolve({}));
  }

  function initController(callback: Function = _.noop, allUserEntitlements: string[] = ['squared-fusion-uc', 'squared-fusion-ec']) {
    ctrl = $componentController('hybridCallServiceConnectUserSettings', {}, {
      userId: '1234',
      userEmailAddress: 'test@example.org',
      entitlementUpdatedCallback: callback,
    });
    ctrl.$onInit();
    ctrl.$onChanges({
      allUserEntitlements: {
        currentValue: allUserEntitlements,
      },
    });
    $scope.$apply();
  }

  it('should read the Connect status and update internal entitlement data when user is *not* entitled', () => {
    initController(_.noop, ['']);
    expect(HybridServiceUserSidepanelHelperService.getDataFromUSS.calls.count()).toBe(1);
    expect(ctrl.userIsCurrentlyEntitled).toBe(false);
  });

  it('should read the Connect status and update internal entitlement data when user is entitled', () => {
    initController(_.noop, ['squared-fusion-ec']);
    $scope.$apply();
    expect(ctrl.userIsCurrentlyEntitled).toBe(true);
  });

  it('should not remove Aware when removing Connect', () => {

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

    const callbackSpy = jasmine.createSpy('callback');

    initController(callbackSpy, []);

    ctrl.newEntitlementValue = true;
    ctrl.saveData();
    $scope.$apply();

    expect(HybridServiceUserSidepanelHelperService.getDataFromUSS.calls.count()).toBe(2);
    expect(callbackSpy.calls.count()).toBe(1);
    expect(callbackSpy).toHaveBeenCalledWith({
      options: {
        entitledToConnect: true,
      },
    });

  });

});
