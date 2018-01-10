import hybridCalendarServiceUserSettingsModuleName from './index';

describe('HybridCalendarServiceUserSettingsCtrl', () => {

  let $componentController, $q, $scope, CloudConnectorService, HybridServicesClusterService, HybridServiceUserSidepanelHelperService, USSService;

  beforeEach(function () {
    this.initModules(hybridCalendarServiceUserSettingsModuleName);
  });

  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  afterEach(cleanup);

  function dependencies (_$componentController_, _$q_, _$rootScope_, _CloudConnectorService_, _HybridServicesClusterService_, _HybridServiceUserSidepanelHelperService_, _USSService_) {
    $componentController = _$componentController_;
    $q = _$q_;
    $scope = _$rootScope_.$new();
    CloudConnectorService = _CloudConnectorService_;
    HybridServicesClusterService = _HybridServicesClusterService_;
    HybridServiceUserSidepanelHelperService = _HybridServiceUserSidepanelHelperService_;
    USSService = _USSService_;
  }

  function cleanup() {
    $componentController = $componentController = $q = $scope = CloudConnectorService = HybridServicesClusterService = HybridServiceUserSidepanelHelperService = USSService = undefined;
  }

  function initSpies() {
    spyOn(USSService, 'getStatusesForUser');
    spyOn(CloudConnectorService, 'getService');
    spyOn(HybridServicesClusterService, 'serviceIsSetUp');
    spyOn(HybridServiceUserSidepanelHelperService, 'saveUserEntitlements').and.returnValue($q.resolve({}));
  }

  function initController(userId: string, userEmailAddress: string = 'someting@example.org', userUpdatedCallback: Function = _.noop, allUserEntitlements?: string[]) {
    const ctrl = $componentController('hybridCalendarServiceUserSettings', {}, {});
    ctrl.$onChanges({
      userId: {
        currentValue: userId,
      },
      userEmailAddress: {
        currentValue: userEmailAddress,
      },
      userUpdatedCallback: {
        currentValue: userUpdatedCallback,
      },
      allUserEntitlements: {
        currentValue: allUserEntitlements || ['squared-fusion-cal'],
      },
    });
    $scope.$apply();
    return ctrl;
  }

  it('should get data from USS, CCC, and FMS on init', () => {
    USSService.getStatusesForUser.and.returnValue($q.resolve({}));
    CloudConnectorService.getService.and.returnValue($q.resolve({}));
    HybridServicesClusterService.serviceIsSetUp.and.returnValue($q.resolve(true));

    const userId = '9876';
    initController(userId);

    expect(USSService.getStatusesForUser.calls.count()).toBe(1);
    expect(USSService.getStatusesForUser).toHaveBeenCalledWith(userId);
    expect(CloudConnectorService.getService.calls.count()).toBe(2);
    expect(CloudConnectorService.getService).toHaveBeenCalledWith('squared-fusion-o365');
    expect(CloudConnectorService.getService).toHaveBeenCalledWith('squared-fusion-gcal');
    expect(HybridServicesClusterService.serviceIsSetUp.calls.count()).toBe(1);
    expect(HybridServicesClusterService.serviceIsSetUp).toHaveBeenCalledWith('squared-fusion-cal');
  });

  it('should gray out Google Calendar and explain why if it hasn\'t been set up', () => {
    USSService.getStatusesForUser.and.returnValue($q.resolve({}));
    CloudConnectorService.getService.and.returnValues($q.resolve({
      provisioned: true,
    }), $q.resolve({
      provisioned: false,
    }));
    HybridServicesClusterService.serviceIsSetUp.and.returnValue($q.resolve(true));

    const ctrl = initController('something');

    expect(ctrl.googleHelpText).toBeDefined();
  });

  it('should gray out Exchange/Office365 and explain why if it hasn\'t been set up in the CCC or on-premises', () => {
    USSService.getStatusesForUser.and.returnValue($q.resolve({}));
    CloudConnectorService.getService.and.returnValues($q.resolve({
      provisioned: false,
    }), $q.resolve({
      provisioned: true,
    }));
    HybridServicesClusterService.serviceIsSetUp.and.returnValue($q.resolve(false));

    const ctrl = initController('something');

    expect(ctrl.exchangeAndOffice365HelpText).toBeDefined();
  });

  it('should not show any "not set up" texts if services have been set up', () => {
    USSService.getStatusesForUser.and.returnValue($q.resolve({}));
    CloudConnectorService.getService.and.returnValues($q.resolve({
      provisioned: true,
    }), $q.resolve({
      provisioned: true,
    }));
    HybridServicesClusterService.serviceIsSetUp.and.returnValue($q.resolve(true));

    const ctrl = initController('something');

    expect(ctrl.exchangeAndOffice365HelpText).not.toBeDefined();
    expect(ctrl.googleHelpText).not.toBeDefined();
  });

  it('should select Exchange/Office as the calendar type if the user is entitled to squared-fusion-cal', () => {
    USSService.getStatusesForUser.and.returnValue($q.resolve({}));
    CloudConnectorService.getService.and.returnValues($q.resolve({
      provisioned: true,
    }), $q.resolve({
      provisioned: true,
    }));
    HybridServicesClusterService.serviceIsSetUp.and.returnValue($q.resolve(true));

    const ctrl = initController('something', '', () => {}, ['squared-fusion-cal']);
    expect(ctrl.originalCalendarType).toBe('squared-fusion-cal');
  });

  it('should select Google as the calendar type if the user is entitled to squared-fusion-gcal', () => {
    USSService.getStatusesForUser.and.returnValue($q.resolve({}));
    CloudConnectorService.getService.and.returnValues($q.resolve({
      provisioned: true,
    }), $q.resolve({
      provisioned: true,
    }));
    HybridServicesClusterService.serviceIsSetUp.and.returnValue($q.resolve(true));

    const ctrl = initController('something', '', () => {}, ['squared-fusion-gcal']);
    expect(ctrl.originalCalendarType).toBe('squared-fusion-gcal');
  });

  it('should select Exchange/Office as the calendar type if the user is entitled to both, but also give a warning', () => {
    USSService.getStatusesForUser.and.returnValue($q.resolve({}));
    CloudConnectorService.getService.and.returnValues($q.resolve({
      provisioned: true,
    }), $q.resolve({
      provisioned: true,
    }));
    HybridServicesClusterService.serviceIsSetUp.and.returnValue($q.resolve(true));

    const ctrl = initController('something', '', () => {}, ['squared-fusion-cal', 'squared-fusion-gcal']);
    expect(ctrl.originalCalendarType).toBe('squared-fusion-cal');
    expect(ctrl.userHasBothCalendarEntitlements).toBe(true);
  });

  it('should save the Exchange/Office365 entitlement if the "Exchange/Office365" has been selected, and disentitle Google Calendar if previously entitled', () => {
    USSService.getStatusesForUser.and.returnValue($q.resolve({}));
    CloudConnectorService.getService.and.returnValue($q.resolve());
    HybridServicesClusterService.serviceIsSetUp.and.returnValue($q.resolve(true));

    const expectedUserId = 'ree2k';
    const expectedEmailAddress = 'kjetil@r.ee';

    const ctrl = initController(expectedUserId, expectedEmailAddress, () => {}, ['squared-fusion-gcal']);
    ctrl.selectedCalendarType = 'squared-fusion-cal';
    ctrl.save();
    $scope.$apply();
    expect(HybridServiceUserSidepanelHelperService.saveUserEntitlements).toHaveBeenCalledWith(expectedUserId, expectedEmailAddress, [{
      entitlementName: 'squaredFusionCal',
      entitlementState: 'ACTIVE',
    }, {
      entitlementName: 'squaredFusionGCal',
      entitlementState: 'INACTIVE',
    }]);
  });

  it('should save the Google Calendar entitlement if the "Google Calendar" has been selected, and disentitle Exchange/Office365 if previously entitled', () => {
    USSService.getStatusesForUser.and.returnValue($q.resolve({}));
    CloudConnectorService.getService.and.returnValue($q.resolve());
    HybridServicesClusterService.serviceIsSetUp.and.returnValue($q.resolve(true));

    const expectedUserId = 'ree2k';
    const expectedEmailAddress = 'kjetil@r.ee';

    const ctrl = initController(expectedUserId, expectedEmailAddress, () => {}, ['squared-fusion-cal']);
    ctrl.selectedCalendarType = 'squared-fusion-gcal';
    ctrl.save();
    $scope.$apply();
    expect(HybridServiceUserSidepanelHelperService.saveUserEntitlements).toHaveBeenCalledWith(expectedUserId, expectedEmailAddress, [{
      entitlementName: 'squaredFusionGCal',
      entitlementState: 'ACTIVE',
    }, {
      entitlementName: 'squaredFusionCal',
      entitlementState: 'INACTIVE',
    }]);
  });

  it('should refresh the user in USS after saving Exchange/Office365 entitlements, and the call the provided callback', () => {
    USSService.getStatusesForUser.and.returnValue($q.resolve([]));
    CloudConnectorService.getService.and.returnValue($q.resolve());
    HybridServicesClusterService.serviceIsSetUp.and.returnValue($q.resolve(true));

    const userId = '1234-5678-9988';
    const callbackFunction = jasmine.createSpy('callback');
    const ctrl = initController(userId, 'something', callbackFunction);
    ctrl.selectedCalendarType = 'squared-fusion-cal';
    ctrl.selectedEntitledToggle = true;
    ctrl.save();
    $scope.$apply();

    expect(USSService.getStatusesForUser.calls.count()).toBe(2);
    expect(USSService.getStatusesForUser).toHaveBeenCalledWith(userId);
    expect(callbackFunction).toHaveBeenCalledWith(({
      options: {
        calendarServiceEntitled: true,
        calendarType: 'squared-fusion-cal',
        refresh: true,
      },
    }));
  });

  it('should refresh the user in USS after saving Google Calendar entitlements, and the call the provided callback', () => {
    USSService.getStatusesForUser.and.returnValue($q.resolve([]));
    CloudConnectorService.getService.and.returnValue($q.resolve());
    HybridServicesClusterService.serviceIsSetUp.and.returnValue($q.resolve(true));

    const userId = '1234-5678-9988';
    const callbackFunction = jasmine.createSpy('callback');
    const ctrl = initController(userId, 'something', callbackFunction);
    ctrl.selectedCalendarType = 'squared-fusion-gcal';
    ctrl.selectedEntitledToggle = true;
    ctrl.save();
    $scope.$apply();

    expect(USSService.getStatusesForUser.calls.count()).toBe(2);
    expect(USSService.getStatusesForUser).toHaveBeenCalledWith(userId);
    expect(callbackFunction).toHaveBeenCalledWith(({
      options: {
        calendarServiceEntitled: true,
        calendarType: 'squared-fusion-gcal',
        refresh: true,
      },
    }));
  });

  it('should refresh the user in USS after disentitling, and the call the provided callback', () => {
    USSService.getStatusesForUser.and.returnValue($q.resolve([]));
    CloudConnectorService.getService.and.returnValue($q.resolve());
    HybridServicesClusterService.serviceIsSetUp.and.returnValue($q.resolve(true));

    const userId = '1234-5678-9988';
    const callbackFunction = jasmine.createSpy('callback');
    const ctrl = initController(userId, 'something', callbackFunction);
    ctrl.selectedCalendarType = 'squared-fusion-cal';
    ctrl.selectedEntitledToggle = false;
    ctrl.save();
    $scope.$apply();

    expect(USSService.getStatusesForUser.calls.count()).toBe(2);
    expect(USSService.getStatusesForUser).toHaveBeenCalledWith(userId);
    expect(callbackFunction).toHaveBeenCalledWith(({
      options: {
        calendarServiceEntitled: false,
        calendarType: 'squared-fusion-cal',
        refresh: true,
      },
    }));
  });

});
