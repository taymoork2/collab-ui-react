import hybridMessagingUserSettings from './index';

describe('hybridImpUserSettings', () => {

  let $componentController, $q, $scope, ctrl, HybridServiceUserSidepanelHelperService, USSService;

  beforeEach(angular.mock.module('Hercules'));

  beforeEach(function () {
    this.initModules(hybridMessagingUserSettings);
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
    spyOn(USSService, 'getStatusesForUser').and.returnValue($q.resolve([{
      entitled: true,
      serviceId: 'spark-hybrid-impinterop',
    }, {
      entitled: false,
      serviceId: 'spark-hybrid-somethingelse',
    }]));
    spyOn(HybridServiceUserSidepanelHelperService, 'saveUserEntitlements').and.returnValue($q.resolve({}));
  }

  function initController(userId, emailAddress) {
    ctrl = $componentController('hybridMessagingUserSettings', {}, {
      userId: undefined,
      userEmailAddress: emailAddress,
      userUpdatedCallback: _.noop(),
    });
    ctrl.$onChanges({
      userId: {
        previousValue: undefined,
        currentValue: userId,
        isFirstChange() {
          return true;
        },
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
