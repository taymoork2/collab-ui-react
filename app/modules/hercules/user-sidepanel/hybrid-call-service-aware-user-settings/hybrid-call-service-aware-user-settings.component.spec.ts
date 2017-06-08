import hybridCallServiceAwareUserSettings from './index';
import { IUserStatus } from 'modules/hercules/services/hybrid-services-user-sidepanel-helper.service';

describe('hybridCallServiceAwareUserSettings', () => {

  let $componentController, $q, $scope, ctrl, DomainManagementService, HybridServicesClusterService, HybridServiceUserSidepanelHelperService, ModalService, UCCService, UriVerificationService;

  beforeEach(angular.mock.module('Hercules'));

  beforeEach(function () {
    this.initModules(hybridCallServiceAwareUserSettings);
  });

  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  afterEach(cleanup);

  function dependencies (_$componentController_, _$q_, $rootScope, _DomainManagementService_, _HybridServicesClusterService_, _HybridServiceUserSidepanelHelperService_, _ModalService_, _UCCService_, _UriVerificationService_) {
    $componentController = _$componentController_;
    $q = _$q_;
    $scope = $rootScope;
    DomainManagementService = _DomainManagementService_;
    HybridServicesClusterService = _HybridServicesClusterService_;
    HybridServiceUserSidepanelHelperService = _HybridServiceUserSidepanelHelperService_;
    ModalService = _ModalService_;
    UCCService = _UCCService_;
    UriVerificationService = _UriVerificationService_;
  }

  function cleanup() {
    $componentController = ctrl = $scope = DomainManagementService = HybridServicesClusterService = HybridServiceUserSidepanelHelperService = UCCService = UriVerificationService = undefined;
  }

  function initSpies() {
    spyOn(HybridServiceUserSidepanelHelperService, 'getDataFromUSS');
    spyOn(HybridServiceUserSidepanelHelperService, 'saveUserEntitlements');
    spyOn(HybridServicesClusterService, 'get');
    spyOn(UCCService, 'getUserDiscovery');
    spyOn(DomainManagementService, 'getVerifiedDomains').and.returnValue($q.resolve({}));
    spyOn(UriVerificationService, 'isDomainVerified').and.returnValue(false);
    spyOn(ModalService, 'open').and.returnValue({
      result: $q.resolve(),
    });
  }

  function initController(callback: Function = () => {}) {
    ctrl = $componentController('hybridCallServiceAwareUserSettings', {}, {
      userId: '1234',
      userEmailAddress: 'test@example.org',
      entitlementUpdatedCallback: callback,
    });
    ctrl.$onInit();
    $scope.$apply();
  }

  it('should read the Aware status and update internal entitlement data when user is *not* entitled', () => {
    let callServiceAwareExpectedStatus: IUserStatus = {
      serviceId: 'squared-fusion-uc',
      entitled: false,
      lastStateChange: 1234,
      lastStateChangeText: 'something',
    };
    HybridServiceUserSidepanelHelperService.getDataFromUSS.and.returnValue($q.resolve([callServiceAwareExpectedStatus, {}]));
    initController();

    expect(HybridServiceUserSidepanelHelperService.getDataFromUSS.calls.count()).toBe(1);
    expect(ctrl.userIsCurrentlyEntitled).toBe(false);
  });

  it('should read the Aware status and update internal entitlement data when user is entitled', () => {
    let callServiceAwareExpectedStatus: IUserStatus = {
      serviceId: 'squared-fusion-uc',
      entitled: true,
      lastStateChange: 1234,
      lastStateChangeText: 'something',
    };
    HybridServiceUserSidepanelHelperService.getDataFromUSS.and.returnValue($q.resolve([callServiceAwareExpectedStatus, {}]));
    UCCService.getUserDiscovery.and.returnValue($q.resolve({}));
    initController();
    ctrl.$onInit();
    $scope.$apply();
    expect(ctrl.userIsCurrentlyEntitled).toBe(true);
  });

  it('should get and store the directory URI from UCCService, and then do a check for verified domains', () => {
    const expectedDirectoryURI = 'manchester@example.org';
    let callServiceAwareExpectedStatus: IUserStatus = {
      serviceId: 'squared-fusion-uc',
      entitled: true,
      lastStateChange: 1234,
      lastStateChangeText: 'something',
    };
    HybridServiceUserSidepanelHelperService.getDataFromUSS.and.returnValue($q.resolve([callServiceAwareExpectedStatus, {}]));
    UCCService.getUserDiscovery.and.returnValue($q.resolve({
      directoryURI: expectedDirectoryURI,
    }));
    initController();

    expect(UCCService.getUserDiscovery.calls.count()).toBe(1);
    expect(DomainManagementService.getVerifiedDomains.calls.count()).toBe(1);
    expect(UriVerificationService.isDomainVerified.calls.count()).toBe(1);

    expect(ctrl.directoryUri).toBe(expectedDirectoryURI);
    expect(ctrl.domainVerificationError).toBe(true);
  });

  it('should get the homed connector and cluster from FMS if USS says the user is homed', () => {
    const clusterId = '3.14';
    const connectorId = '2.718';
    const expectedConnector = {
      id: connectorId,
    };
    const expectedCluster = {
      id: clusterId,
      connectors: [expectedConnector],
    };

    let callServiceAwareExpectedStatus: IUserStatus = {
      connectorId: connectorId,
      clusterId: clusterId,
      serviceId: 'squared-fusion-uc',
      entitled: true,
      lastStateChange: 1234,
      lastStateChangeText: 'something',
    };
    HybridServiceUserSidepanelHelperService.getDataFromUSS.and.returnValue($q.resolve([callServiceAwareExpectedStatus, {}]));
    HybridServicesClusterService.get.and.returnValue($q.resolve(expectedCluster));
    UCCService.getUserDiscovery.and.returnValue($q.resolve({}));

    initController();

    expect(ctrl.homedCluster).toBe(expectedCluster);
    expect(ctrl.homedConnector).toBe(expectedConnector);
    expect(HybridServicesClusterService.get.calls.count()).toBe(1);
  });

  it('should display a popup confirmation on save if Call Service Connect is enabled for the user', () => {

    let callServiceAwareExpectedStatus: IUserStatus = {
      serviceId: 'squared-fusion-uc',
      entitled: true,
      lastStateChange: 1234,
      lastStateChangeText: 'something',
    };
    let callServiceConnectExpectedStatus: IUserStatus = {
      serviceId: 'squared-fusion-ec',
      entitled: true,
      lastStateChange: 1234,
      lastStateChangeText: 'something',
    };
    HybridServiceUserSidepanelHelperService.getDataFromUSS.and.returnValue($q.resolve([callServiceAwareExpectedStatus, callServiceConnectExpectedStatus]));
    UCCService.getUserDiscovery.and.returnValue($q.resolve({}));

    initController();

    ctrl.save();
    expect(ModalService.open.calls.count()).toBe(1);
  });

  it('should automatically remove Connect as well when Aware is being removed, if Connect is enabled', () => {

    const callServiceAwareExpectedStatus: IUserStatus = {
      serviceId: 'squared-fusion-uc',
      entitled: true,
      lastStateChange: 1234,
      lastStateChangeText: 'something',
    };
    const callServiceConnectExpectedStatus: IUserStatus = {
      serviceId: 'squared-fusion-ec',
      entitled: true,
      lastStateChange: 1234,
      lastStateChangeText: 'something',
    };
    const expectedEntitlements = [{
      entitlementName: 'squaredFusionUC',
      entitlementState: 'INACTIVE',
    }, {
      entitlementName: 'squaredFusionEC',
      entitlementState: 'INACTIVE',
    }];
    HybridServiceUserSidepanelHelperService.saveUserEntitlements.and.returnValue($q.resolve({}));
    HybridServiceUserSidepanelHelperService.getDataFromUSS.and.returnValue($q.resolve([callServiceAwareExpectedStatus, callServiceConnectExpectedStatus]));
    UCCService.getUserDiscovery.and.returnValue($q.resolve({}));

    initController();

    ctrl.newEntitlementValue = false;
    ctrl.saveData();

    expect(HybridServiceUserSidepanelHelperService.saveUserEntitlements).toHaveBeenCalledWith('1234', 'test@example.org', expectedEntitlements);
  });

  it('should not touch Connect when enabling Aware', () => {

    const callServiceAwareExpectedStatus: IUserStatus = {
      serviceId: 'squared-fusion-uc',
      entitled: false,
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
    }];
    HybridServiceUserSidepanelHelperService.saveUserEntitlements.and.returnValue($q.resolve({}));
    HybridServiceUserSidepanelHelperService.getDataFromUSS.and.returnValue($q.resolve([callServiceAwareExpectedStatus, callServiceConnectExpectedStatus]));
    UCCService.getUserDiscovery.and.returnValue($q.resolve({}));

    initController();

    ctrl.newEntitlementValue = true;
    ctrl.saveData();

    expect(HybridServiceUserSidepanelHelperService.saveUserEntitlements).toHaveBeenCalledWith('1234', 'test@example.org', expectedEntitlements);
  });

  it('should on save call the callback, after waiting a bit and probing USS for fresh data', () => {

    let callbackSpy = jasmine.createSpy('callback');

    const callServiceAwareStatusBefore: IUserStatus = {
      serviceId: 'squared-fusion-uc',
      entitled: false,
      lastStateChange: 1234,
      lastStateChangeText: 'something',
    };

    const callServiceAwareStatusAfter: IUserStatus = {
      serviceId: 'squared-fusion-uc',
      entitled: true,
      lastStateChange: 1234,
      lastStateChangeText: 'something',
    };

    HybridServiceUserSidepanelHelperService.saveUserEntitlements.and.returnValue($q.resolve({}));
    HybridServiceUserSidepanelHelperService.getDataFromUSS.and.returnValues($q.resolve([callServiceAwareStatusBefore, {}]), $q.resolve([callServiceAwareStatusAfter, {}]));
    UCCService.getUserDiscovery.and.returnValue($q.resolve({}));

    initController(callbackSpy);

    ctrl.saveData();
    $scope.$apply();

    expect(HybridServiceUserSidepanelHelperService.getDataFromUSS.calls.count()).toBe(2);
    expect(callbackSpy.calls.count()).toBe(1);
    expect(callbackSpy).toHaveBeenCalledWith({
      options: {
        callServiceAware: callServiceAwareStatusAfter,
        callServiceConnect: {},
      },
    });

  });

});
