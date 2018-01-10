import hybridCallServiceAggregatedSectionModuleName from './index';

describe('HybridCallServiceAggregatedSectionComponent', () => {

  let $componentController, $q, $state, $scope, ctrl, HybridServiceUserSidepanelHelperService, Userservice, ServiceDescriptorService;

  beforeEach(function () {
    this.initModules(hybridCallServiceAggregatedSectionModuleName);
  });

  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  afterEach(cleanup);

  function dependencies (_$componentController_, _$q_, _$state_, $rootScope, _HybridServiceUserSidepanelHelperService_, _Userservice_, _ServiceDescriptorService_) {
    $componentController = _$componentController_;
    $q = _$q_;
    $scope = $rootScope;
    $state = _$state_;
    HybridServiceUserSidepanelHelperService = _HybridServiceUserSidepanelHelperService_;
    Userservice = _Userservice_;
    ServiceDescriptorService = _ServiceDescriptorService_;
  }

  function cleanup() {
    $componentController = $q = $state = $scope = ctrl = HybridServiceUserSidepanelHelperService = Userservice = ServiceDescriptorService = undefined;
  }

  function initSpies() {
    spyOn(HybridServiceUserSidepanelHelperService, 'getDataFromUSS').and.returnValue($q.resolve([{}, {}]));
    spyOn(Userservice, 'getUserAsPromise').and.returnValue($q.resolve({
      data: {
        entitlements: ['squared-fusion-uc'],
      },
    }));
    spyOn(ServiceDescriptorService, 'isServiceEnabled').and.returnValue($q.resolve({}));
  }

  function initController(userUpdatedCallback: Function = _.noop, userId: string = '1234') {
    ctrl = $componentController('hybridCallServiceAggregatedSection', {}, {
      userId: userId,
      userUpdatedCallback: userUpdatedCallback,
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

    ServiceDescriptorService.isServiceEnabled.and.returnValue($q.resolve(true));

    initController();
    ctrl.$onInit();
    $scope.$apply();

    expect(ServiceDescriptorService.isServiceEnabled).toHaveBeenCalledWith('squared-fusion-ec');
    expect(ServiceDescriptorService.isServiceEnabled.calls.count()).toBe(1);
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

  it('should update the top level component with entitlement data when the children execute the callback', () => {

    const callbackFunction = jasmine.createSpy('callback');

    initController(callbackFunction);
    ctrl.$onInit();
    $scope.$apply();

    ctrl.onEntitlementChanges({
      entitledToAware: true,
      entitledToConnect: true,
    });

    expect(callbackFunction).toHaveBeenCalledWith(({
      options: {
        refresh: true,
        callServiceAware: true,
        callServiceConnect: true,
      },
    }));
  });

  it('should get data from Common Identity on init, and then again when the children execute the callback', () => {

    const callbackFunction = jasmine.createSpy('callback');
    const userId = 'kjetil-1234-5678';

    initController(callbackFunction, userId);
    ctrl.$onInit();
    $scope.$apply();

    expect(Userservice.getUserAsPromise).toHaveBeenCalledWith(userId);
    expect(Userservice.getUserAsPromise.calls.count()).toBe(1);

    ctrl.onEntitlementChanges({
      entitledToAware: false,
      entitledToConnect: false,
    });
    expect(Userservice.getUserAsPromise.calls.count()).toBe(2);
  });

});
