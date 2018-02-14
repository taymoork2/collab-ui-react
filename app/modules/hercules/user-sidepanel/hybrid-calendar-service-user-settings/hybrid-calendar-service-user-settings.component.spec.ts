import hybridCalendarServiceUserSettingsModuleName from './index';

describe('HybridCalendarServiceUserSettingsCtrl', () => {

  let $componentController, $q, $scope, CloudConnectorService, HybridServiceUserSidepanelHelperService, USSService, UserOverviewService, ServiceDescriptorService;

  beforeEach(function () {
    this.initModules(hybridCalendarServiceUserSettingsModuleName);
  });

  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  afterEach(cleanup);

  function dependencies (_$componentController_, _$q_, _$rootScope_, _CloudConnectorService_, _HybridServiceUserSidepanelHelperService_, _USSService_, _UserOverviewService_, _ServiceDescriptorService_) {
    $componentController = _$componentController_;
    $q = _$q_;
    $scope = _$rootScope_.$new();
    CloudConnectorService = _CloudConnectorService_;
    HybridServiceUserSidepanelHelperService = _HybridServiceUserSidepanelHelperService_;
    USSService = _USSService_;
    UserOverviewService = _UserOverviewService_;
    ServiceDescriptorService = _ServiceDescriptorService_;
  }

  function cleanup() {
    $componentController = $componentController = $q = $scope = CloudConnectorService =  HybridServiceUserSidepanelHelperService = USSService = UserOverviewService = ServiceDescriptorService = undefined;
  }

  function initSpies() {
    spyOn(USSService, 'getStatusesForUser');
    spyOn(UserOverviewService, 'getUser');
    spyOn(CloudConnectorService, 'getService');
    spyOn(ServiceDescriptorService, 'isServiceEnabled');
    spyOn(HybridServiceUserSidepanelHelperService, 'saveUserEntitlements').and.returnValue($q.resolve({}));
  }

  function initController(userId: string, userEmailAddress: string = 'someting@example.org') {
    const ctrl = $componentController('hybridCalendarServiceUserSettings', {}, {});
    ctrl.$onChanges({
      userId: {
        currentValue: userId,
      },
      userEmailAddress: {
        currentValue: userEmailAddress,
      },
    });
    $scope.$apply();
    return ctrl;
  }

  it('should get data from Common Identity, USS, CCC, and FMS on init', () => {
    UserOverviewService.getUser.and.returnValue($q.resolve({
      user: {
        entitlements: [],
      },
    }));
    USSService.getStatusesForUser.and.returnValue($q.resolve({}));
    CloudConnectorService.getService.and.returnValue($q.resolve({}));
    ServiceDescriptorService.isServiceEnabled.and.returnValue($q.resolve(true));

    const userId = '9876';
    initController(userId);

    expect(UserOverviewService.getUser.calls.count()).toBe(1);
    expect(UserOverviewService.getUser).toHaveBeenCalledWith(userId);
    expect(USSService.getStatusesForUser.calls.count()).toBe(1);
    expect(USSService.getStatusesForUser).toHaveBeenCalledWith(userId);
    expect(CloudConnectorService.getService.calls.count()).toBe(2);
    expect(CloudConnectorService.getService).toHaveBeenCalledWith('squared-fusion-o365');
    expect(CloudConnectorService.getService).toHaveBeenCalledWith('squared-fusion-gcal');
    expect(ServiceDescriptorService.isServiceEnabled.calls.count()).toBe(1);
    expect(ServiceDescriptorService.isServiceEnabled).toHaveBeenCalledWith('squared-fusion-cal');
  });

  it('should default the radio buttons to Microsoft calendar if the user has no entitlements whatsoever', () => {
    UserOverviewService.getUser.and.returnValue($q.resolve({
      user: {
        entitlements: [],
      },
    }));
    USSService.getStatusesForUser.and.returnValue($q.resolve({}));
    CloudConnectorService.getService.and.returnValue($q.resolve({}));
    const ctrl = initController('something', 'something@example.org');
    expect(ctrl.originalCalendarType).toBe('squared-fusion-cal');
    expect(ctrl.selectedCalendarType).toBe('squared-fusion-cal');
  });

  it('should add a help text if Google Calendar hasn\'t been set up', () => {
    USSService.getStatusesForUser.and.returnValue($q.resolve({}));
    CloudConnectorService.getService.and.returnValues($q.resolve({
      provisioned: true,
    }), $q.resolve({
      provisioned: false,
    }));
    ServiceDescriptorService.isServiceEnabled.and.returnValue($q.resolve(true));

    const ctrl = initController('something');

    expect(ctrl.googleHelpText).toBeDefined();
  });

  it('should add a help text if Exchange/Office365 hasn\'t been set up in the CCC or on-premises', () => {
    USSService.getStatusesForUser.and.returnValue($q.resolve({}));
    CloudConnectorService.getService.and.returnValues($q.resolve({
      provisioned: false,
    }), $q.resolve({
      provisioned: true,
    }));
    ServiceDescriptorService.isServiceEnabled.and.returnValue($q.resolve(false));

    const ctrl = initController('something', 'something@example.org');

    expect(ctrl.exchangeAndOffice365HelpText).toBeDefined();
  });

  it('should not show any "not set up" texts if services have been set up', () => {
    USSService.getStatusesForUser.and.returnValue($q.resolve({}));
    CloudConnectorService.getService.and.returnValues($q.resolve({
      provisioned: true,
    }), $q.resolve({
      provisioned: true,
    }));
    ServiceDescriptorService.isServiceEnabled.and.returnValue($q.resolve(true));

    const ctrl = initController('something', 'something@example.org');

    expect(ctrl.exchangeAndOffice365HelpText).not.toBeDefined();
    expect(ctrl.googleHelpText).not.toBeDefined();
  });

  it('should select Exchange/Office as the calendar type if the user is entitled to squared-fusion-cal', () => {
    UserOverviewService.getUser.and.returnValue($q.resolve({
      user: {
        entitlements: ['squared-fusion-cal'],
      },
    }));
    USSService.getStatusesForUser.and.returnValue($q.resolve({}));
    CloudConnectorService.getService.and.returnValues($q.resolve({
      provisioned: true,
    }), $q.resolve({
      provisioned: true,
    }));
    ServiceDescriptorService.isServiceEnabled.and.returnValue($q.resolve(true));

    const ctrl = initController('something', '');
    expect(ctrl.originalCalendarType).toBe('squared-fusion-cal');
  });

  it('should select Google as the calendar type if the user is entitled to squared-fusion-gcal', () => {
    UserOverviewService.getUser.and.returnValue($q.resolve({
      user: {
        entitlements: ['squared-fusion-gcal'],
      },
    }));
    USSService.getStatusesForUser.and.returnValue($q.resolve({}));
    CloudConnectorService.getService.and.returnValues($q.resolve({
      provisioned: true,
    }), $q.resolve({
      provisioned: true,
    }));
    ServiceDescriptorService.isServiceEnabled.and.returnValue($q.resolve(true));

    const ctrl = initController('something', '');
    expect(ctrl.originalCalendarType).toBe('squared-fusion-gcal');
  });

  it('should select Exchange/Office as the calendar type if the user is entitled to both, but also give a warning', () => {
    UserOverviewService.getUser.and.returnValue($q.resolve({
      user: {
        entitlements: ['squared-fusion-cal', 'squared-fusion-gcal'],
      },
    }));
    USSService.getStatusesForUser.and.returnValue($q.resolve({}));
    CloudConnectorService.getService.and.returnValues($q.resolve({
      provisioned: true,
    }), $q.resolve({
      provisioned: true,
    }));
    ServiceDescriptorService.isServiceEnabled.and.returnValue($q.resolve(true));

    const ctrl = initController('something', '');
    expect(ctrl.originalCalendarType).toBe('squared-fusion-cal');
    expect(ctrl.userHasBothCalendarEntitlements).toBe(true);
  });

  it('should save the Exchange/Office365 entitlement if the "Exchange/Office365" has been selected, and disentitle Google Calendar if previously entitled', () => {
    UserOverviewService.getUser.and.returnValue($q.resolve({
      user: {
        entitlements: ['squared-fusion-gcal'],
      },
    }));
    USSService.getStatusesForUser.and.returnValue($q.resolve({}));
    CloudConnectorService.getService.and.returnValue($q.resolve());
    ServiceDescriptorService.isServiceEnabled.and.returnValue($q.resolve(true));

    const expectedUserId = 'ree2k';
    const expectedEmailAddress = 'kjetil@r.ee';

    const ctrl = initController(expectedUserId, expectedEmailAddress);
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
    UserOverviewService.getUser.and.returnValue($q.resolve({
      user: {
        entitlements: ['squared-fusion-cal'],
      },
    }));
    USSService.getStatusesForUser.and.returnValue($q.resolve({}));
    CloudConnectorService.getService.and.returnValue($q.resolve());
    ServiceDescriptorService.isServiceEnabled.and.returnValue($q.resolve(true));

    const expectedUserId = 'ree2k';
    const expectedEmailAddress = 'kjetil@r.ee';

    const ctrl = initController(expectedUserId, expectedEmailAddress);
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

  it('should refresh the user in USS after saving Exchange/Office365 entitlements', () => {
    USSService.getStatusesForUser.and.returnValue($q.resolve([]));
    CloudConnectorService.getService.and.returnValue($q.resolve());
    ServiceDescriptorService.isServiceEnabled.and.returnValue($q.resolve(true));

    const userId = '1234-5678-9988';
    const ctrl = initController(userId, 'something');
    ctrl.selectedCalendarType = 'squared-fusion-cal';
    ctrl.selectedEntitledToggle = true;
    ctrl.save();
    $scope.$apply();

    expect(USSService.getStatusesForUser.calls.count()).toBe(2);
    expect(USSService.getStatusesForUser).toHaveBeenCalledWith(userId);
  });

  it('should refresh the user in USS after saving Google Calendar entitlements', () => {
    USSService.getStatusesForUser.and.returnValue($q.resolve([]));
    CloudConnectorService.getService.and.returnValue($q.resolve());
    ServiceDescriptorService.isServiceEnabled.and.returnValue($q.resolve(true));

    const userId = '1234-5678-9988';
    const ctrl = initController(userId, 'something');
    ctrl.selectedCalendarType = 'squared-fusion-gcal';
    ctrl.selectedEntitledToggle = true;
    ctrl.save();
    $scope.$apply();

    expect(USSService.getStatusesForUser.calls.count()).toBe(2);
    expect(USSService.getStatusesForUser).toHaveBeenCalledWith(userId);
  });

  it('should refresh the user in USS after disentitling', () => {
    USSService.getStatusesForUser.and.returnValue($q.resolve([]));
    CloudConnectorService.getService.and.returnValue($q.resolve());
    ServiceDescriptorService.isServiceEnabled.and.returnValue($q.resolve(true));

    const userId = '1234-5678-9988';
    const ctrl = initController(userId, 'something');
    ctrl.selectedCalendarType = 'squared-fusion-cal';
    ctrl.selectedEntitledToggle = false;
    ctrl.save();
    $scope.$apply();

    expect(USSService.getStatusesForUser.calls.count()).toBe(2);
    expect(USSService.getStatusesForUser).toHaveBeenCalledWith(userId);
  });

});
