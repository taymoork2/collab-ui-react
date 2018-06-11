import hybridCallServiceAggregatedSectionModuleName from './index';

describe('HybridCallServiceAggregatedSectionComponent', () => {

  let $componentController, $q, $state, $scope, ctrl, HybridServiceUserSidepanelHelperService, ServiceDescriptorService, UserOverviewService;

  beforeEach(function () {
    this.initModules(hybridCallServiceAggregatedSectionModuleName);
  });

  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  afterEach(cleanup);

  function dependencies (_$componentController_, _$q_, _$state_, $rootScope, _HybridServiceUserSidepanelHelperService_, _ServiceDescriptorService_, _UserOverviewService_) {
    $componentController = _$componentController_;
    $q = _$q_;
    $scope = $rootScope;
    $state = _$state_;
    HybridServiceUserSidepanelHelperService = _HybridServiceUserSidepanelHelperService_;
    ServiceDescriptorService = _ServiceDescriptorService_;
    UserOverviewService = _UserOverviewService_;
  }

  function cleanup() {
    $componentController = $q = $state = $scope = ctrl = HybridServiceUserSidepanelHelperService = UserOverviewService = ServiceDescriptorService = undefined;
  }

  function initSpies() {
    spyOn(HybridServiceUserSidepanelHelperService, 'getDataFromUSS').and.returnValue($q.resolve([{}, {}]));
    spyOn(UserOverviewService, 'getUser').and.returnValue($q.resolve({
      user: {
        entitlements: ['squared-fusion-uc'],
        pendingStatus: false,
      },
    }));
    spyOn(ServiceDescriptorService, 'getServices').and.returnValue($q.resolve([{
      id: 'squared-fusion-uc',
      enabled: true,
    }, {
      id: 'squared-fusion-ec',
      enabled: true,
    }]));
  }

  function initController(userId: string = '1234') {
    ctrl = $componentController('hybridCallServiceAggregatedSection', {}, {
      userId: userId,
    });
  }

  it('should retrieve the resourceGroupId from USS', () => {

    const expectedResourceGroupId = 'man-united';
    HybridServiceUserSidepanelHelperService.getDataFromUSS.and.returnValue($q.resolve([{
      resourceGroupId: expectedResourceGroupId,
    }, {}]));

    initController();
    ctrl.$onInit();
    $scope.$apply();

    expect(ctrl.resourceGroupId).toBe(expectedResourceGroupId);
  });

  it('should call FMS to get the Call Service Connect setup status', () => {

    initController();
    ctrl.$onInit();
    $scope.$apply();

    expect(ServiceDescriptorService.getServices.calls.count()).toBe(1);
    expect(ctrl.callServiceAwareEnabledForOrg).toBe(true);
    expect(ctrl.callServiceConnectEnabledForOrg).toBe(true);
  });

  it('should get the initial Call Service Aware and Connect statuses based upon data from USS', () => {

    HybridServiceUserSidepanelHelperService.getDataFromUSS.and.returnValue($q.resolve([{
      somekey: 'initial data 01',
    }, {
      otherkey: 'initial data 02',
    }]));

    initController();
    ctrl.$onInit();
    $scope.$apply();

    expect(ctrl.callServiceAware).toEqual(jasmine.objectContaining({
      somekey: 'initial data 01',
    }));
    expect(ctrl.callServiceConnect).toEqual(jasmine.objectContaining({
      otherkey: 'initial data 02',
    }));

  });

  it('should get data from Common Identity on init', () => {

    const userId = 'kjetil-1234-5678';

    initController(userId);
    ctrl.$onInit();
    $scope.$apply();

    expect(UserOverviewService.getUser).toHaveBeenCalledWith(userId);
    expect(UserOverviewService.getUser.calls.count()).toBe(1);
    expect(ctrl.isInvitePending).toBe(false);
    expect(ctrl.allUserEntitlements).toEqual(['squared-fusion-uc']);
  });

});
