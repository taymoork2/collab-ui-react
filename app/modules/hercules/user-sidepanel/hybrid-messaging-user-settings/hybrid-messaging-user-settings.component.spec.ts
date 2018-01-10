import hybridMessageUserSettingsModuleName from './index';

describe('HybridMessageUserSettings', () => {

  let $componentController, $q, $scope, ctrl, HybridServiceUserSidepanelHelperService, USSService;

  beforeEach(function () {
    this.initModules(hybridMessageUserSettingsModuleName);
  });

  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  afterEach(cleanup);

  function dependencies (_$componentController_, _$q_, $rootScope, _HybridServiceUserSidepanelHelperService_, _USSService_) {
    $componentController = _$componentController_;
    $q = _$q_;
    $scope = $rootScope;
    HybridServiceUserSidepanelHelperService = _HybridServiceUserSidepanelHelperService_;
    USSService = _USSService_;
  }

  function cleanup() {
    $componentController = $q = $scope = ctrl = HybridServiceUserSidepanelHelperService = USSService = undefined;
  }

  function initSpies() {
    spyOn(USSService, 'getStatusesForUser').and.returnValue($q.resolve([{}, {}]));
    spyOn(HybridServiceUserSidepanelHelperService, 'saveUserEntitlements').and.returnValue($q.resolve({}));
  }

  function initController(userId, emailAddress, allUserEntitlements: string[] = ['spark-hybrid-impinterop']) {
    ctrl = $componentController('hybridMessageUserSettings', {}, {
      userId: undefined,
      userEmailAddress: emailAddress,
      userUpdatedCallback: _.noop,
    });
    ctrl.$onChanges({
      userId: {
        currentValue: userId,
      },
      allUserEntitlements: {
        currentValue: allUserEntitlements,
      },
    });

  }

  it('should get the current entitlement status from USS', () => {
    initController('some user Id', 'some@email.address');
    $scope.$apply();
    expect(ctrl.userIsCurrentlyEntitled).toBe(true);
  });

  it('should disentitle in Userservice when saving with newEntitlementValue = false, then refresh the component based upon USS data', () => {

    const userId = 'Pogba';
    const emailAddress = 'paul@example.org';
    initController(userId, emailAddress);
    ctrl.newEntitlementValue = false;
    ctrl.saveData();
    $scope.$apply();

    expect(HybridServiceUserSidepanelHelperService.saveUserEntitlements).toHaveBeenCalledWith(userId, emailAddress, [{
      entitlementName: 'sparkHybridImpInterop',
      entitlementState: 'INACTIVE',
    }]);
    expect(USSService.getStatusesForUser.calls.count()).toBe(2);
  });
});
