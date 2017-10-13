import hybridCallServiceConnectUserSettings from './index';
// import { IUserStatus } from 'modules/hercules/services/hybrid-services-user-sidepanel-helper.service';
type IUserStatus = any;

describe('hybridCallServiceConnectUserSettings', () => {

  let $componentController, $q, $scope, ctrl, HybridServiceUserSidepanelHelperService;

  beforeEach(angular.mock.module('Hercules'));

  beforeEach(function () {
    this.initModules(hybridCallServiceConnectUserSettings);
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
    spyOn(HybridServiceUserSidepanelHelperService, 'getDataFromUSS');
    spyOn(HybridServiceUserSidepanelHelperService, 'saveUserEntitlements');
  }

  function initController(callback: Function = () => {}) {
    ctrl = $componentController('hybridCallServiceConnectUserSettings', {}, {
      userId: '1234',
      userEmailAddress: 'test@example.org',
      entitlementUpdatedCallback: callback,
    });
    ctrl.$onInit();
    $scope.$apply();
  }

  it('should read the Connect status and update internal entitlement data when user is *not* entitled', () => {
    const callServiceConnectExpectedStatus: IUserStatus = {
      serviceId: 'squared-fusion-ec',
      entitled: false,
      lastStateChange: 1234,
      lastStateChangeText: 'something',
    };
    HybridServiceUserSidepanelHelperService.getDataFromUSS.and.returnValue($q.resolve([{}, callServiceConnectExpectedStatus]));
    initController();

    expect(HybridServiceUserSidepanelHelperService.getDataFromUSS.calls.count()).toBe(1);
    expect(ctrl.userIsCurrentlyEntitled).toBe(false);
  });

  it('should read the Connect status and update internal entitlement data when user is entitled', () => {
    const callServiceConnectExpectedStatus: IUserStatus = {
      serviceId: 'squared-fusion-ec',
      entitled: true,
      lastStateChange: 1234,
      lastStateChangeText: 'something',
    };
    HybridServiceUserSidepanelHelperService.getDataFromUSS.and.returnValue($q.resolve([{}, callServiceConnectExpectedStatus]));
    initController();
    ctrl.$onInit();
    $scope.$apply();
    expect(ctrl.userIsCurrentlyEntitled).toBe(true);
  });

  it('should not remove Aware when removing Connect', () => {

    const callServiceAwareExpectedStatus: IUserStatus = {
      serviceId: 'squared-fusion-uc',
      entitled: true,
      lastStateChange: 1234,
      lastStateChangeText: 'something',
    };
    const callServiceConnectExpectedStatus: IUserStatus = {
      serviceId: 'squared-fusion-ec',
      entitled: false,
      lastStateChange: 1234,
      lastStateChangeText: 'something',
    };
    const expectedEntitlements = [{
      entitlementName: 'squaredFusionUC',
      entitlementState: 'ACTIVE',
    }, {
      entitlementName: 'squaredFusionEC',
      entitlementState: 'INACTIVE',
    }];
    HybridServiceUserSidepanelHelperService.saveUserEntitlements.and.returnValue($q.resolve({}));
    HybridServiceUserSidepanelHelperService.getDataFromUSS.and.returnValue($q.resolve([callServiceAwareExpectedStatus, callServiceConnectExpectedStatus]));

    initController();

    ctrl.newEntitlementValue = false;
    ctrl.saveData();

    expect(HybridServiceUserSidepanelHelperService.saveUserEntitlements).toHaveBeenCalledWith('1234', 'test@example.org', expectedEntitlements);
  });

  it('should on save call the callback, after waiting a bit and probing USS for fresh data', () => {

    const callbackSpy = jasmine.createSpy('callback');

    const callServiceConnectStatusBefore: IUserStatus = {
      serviceId: 'squared-fusion-uc',
      entitled: false,
      lastStateChange: 1234,
      lastStateChangeText: 'something',
    };

    const callServiceConnectStatusAfter: IUserStatus = {
      serviceId: 'squared-fusion-uc',
      entitled: true,
      lastStateChange: 1234,
      lastStateChangeText: 'something',
    };

    HybridServiceUserSidepanelHelperService.saveUserEntitlements.and.returnValue($q.resolve({}));
    HybridServiceUserSidepanelHelperService.getDataFromUSS.and.returnValues($q.resolve([{}, callServiceConnectStatusBefore]), $q.resolve([{}, callServiceConnectStatusAfter]));

    initController(callbackSpy);

    ctrl.saveData();
    $scope.$apply();

    expect(HybridServiceUserSidepanelHelperService.getDataFromUSS.calls.count()).toBe(2);
    expect(callbackSpy.calls.count()).toBe(1);
    expect(callbackSpy).toHaveBeenCalledWith({
      options: {
        callServiceAware: {},
        callServiceConnect: callServiceConnectStatusAfter,
      },
    });

  });

});
