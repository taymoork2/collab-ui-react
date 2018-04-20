import hybridMessageUserSettingsModuleName from './index';

describe('HybridMessageUserSettings', () => {

  let $componentController, $q, $scope, ctrl, HybridServiceUserSidepanelHelperService, ServiceDescriptorService, USSService, UserOverviewService;

  beforeEach(function () {
    this.initModules(hybridMessageUserSettingsModuleName);
  });

  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  afterEach(cleanup);

  function dependencies (_$componentController_, _$q_, $rootScope, _HybridServiceUserSidepanelHelperService_, _ServiceDescriptorService_, _USSService_, _UserOverviewService_) {
    $componentController = _$componentController_;
    $q = _$q_;
    $scope = $rootScope;
    HybridServiceUserSidepanelHelperService = _HybridServiceUserSidepanelHelperService_;
    ServiceDescriptorService = _ServiceDescriptorService_;
    USSService = _USSService_;
    UserOverviewService = _UserOverviewService_;
  }

  function cleanup() {
    $componentController = $q = $scope = ctrl = HybridServiceUserSidepanelHelperService = ServiceDescriptorService = USSService = UserOverviewService = undefined;
  }

  function initSpies() {
    spyOn(USSService, 'getStatusesForUser').and.returnValue($q.resolve([{}, {}]));
    spyOn(HybridServiceUserSidepanelHelperService, 'saveUserEntitlements').and.returnValue($q.resolve({}));
    spyOn(UserOverviewService, 'getUser');
    spyOn(ServiceDescriptorService, 'isServiceEnabled').and.returnValue($q.resolve(true));
  }

  function initController(userId, emailAddress) {
    ctrl = $componentController('hybridMessageUserSettings', {}, {
      userId: undefined,
      userEmailAddress: emailAddress,
    });
    ctrl.$onChanges({
      userId: {
        currentValue: userId,
      },
    });
  }

  it('should get the current entitlement status from Common Identity', () => {
    UserOverviewService.getUser.and.returnValue($q.resolve({
      user: {
        entitlements: ['spark-hybrid-impinterop'],
      },
    }));
    initController('some user Id', 'some@email.address');
    $scope.$apply();
    expect(ctrl.userIsCurrentlyEntitled).toBe(true);
  });

  it('should disentitle in Common Identity when saving with newEntitlementValue = false, then refresh the component based upon USS data', () => {
    UserOverviewService.getUser.and.returnValue($q.resolve({
      user: {
        entitlements: ['spark-hybrid-impinterop'],
      },
    }));
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

  it('should check service setup status in FMS', () => {
    UserOverviewService.getUser.and.returnValue($q.resolve({
      user: {
        entitlements: ['spark-hybrid-impinterop'],
      },
    }));
    initController('some user Id', 'some@email.address');
    $scope.$apply();

    expect(ServiceDescriptorService.isServiceEnabled.calls.count()).toBe(1);
    expect(ServiceDescriptorService.isServiceEnabled).toHaveBeenCalledWith('spark-hybrid-impinterop');
  });
});
