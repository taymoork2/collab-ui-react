import hybridCallServiceAggregatedSection from './index';

describe('HybridCallServiceAggregatedSectionComponent', () => {

  let $componentController, $httpBackend, $q, $state, $scope, ctrl, FeatureToggleService, HybridServiceUserSidepanelHelperService, ServiceDescriptorService, UCCService;

  beforeEach(angular.mock.module('Hercules'));

  beforeEach(function () {
    this.initModules(hybridCallServiceAggregatedSection);
  });

  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  afterEach(cleanup);

  function dependencies (_$componentController_, _$httpBackend_, _$q_, _$state_, $rootScope, _FeatureToggleService_, _HybridServiceUserSidepanelHelperService_, _ServiceDescriptorService_, _UCCService_) {
    $componentController = _$componentController_;
    $httpBackend = _$httpBackend_;
    $q = _$q_;
    $scope = $rootScope;
    $state = _$state_;
    FeatureToggleService = _FeatureToggleService_;
    HybridServiceUserSidepanelHelperService = _HybridServiceUserSidepanelHelperService_;
    ServiceDescriptorService = _ServiceDescriptorService_;
    UCCService = _UCCService_;
  }

  function cleanup() {
    $componentController = $httpBackend = $q = $state = $scope = ctrl = FeatureToggleService = HybridServiceUserSidepanelHelperService = ServiceDescriptorService = UCCService = undefined;
  }

  function initSpies() {
    spyOn(FeatureToggleService, 'supports').and.returnValue($q.resolve({}));
    spyOn(HybridServiceUserSidepanelHelperService, 'getDataFromUSS').and.returnValue($q.resolve([{}, {}]));
    spyOn(UCCService, 'getOrgVoicemailConfiguration').and.returnValue($q.resolve({
      voicemailOrgEnableInfo: {
        orgHybridVoicemailEnabled: true,
      },
    }));
    spyOn(ServiceDescriptorService, 'isServiceEnabled').and.returnValue($q.resolve({}));
    $httpBackend.expectGET('https://identity.webex.com/identity/scim/null/v1/Users/me').respond(200);
  }

  function initController() {
    ctrl = $componentController('hybridCallServiceAggregatedSection', {}, {});
  }


  it ('should call UCC to get voicemail data if the org is voicemail feature toggled', () => {

    FeatureToggleService.supports.and.returnValue($q.resolve(true));

    initController();
    ctrl.$onInit();
    $scope.$apply();

    expect(UCCService.getOrgVoicemailConfiguration.calls.count()).toBe(1);
    expect(ctrl.voicemailEnabled).toBe(true);
  });

  it ('should not call UCC to get voicemail data if the org is not voicemail feature toggled', () => {

    FeatureToggleService.supports.and.returnValue($q.resolve(false));

    initController();
    ctrl.$onInit();
    $scope.$apply();

    expect(UCCService.getOrgVoicemailConfiguration.calls.count()).toBe(0);
    expect(ctrl.voicemailEnabled).toBe(false);
  });

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

  it('should update the Call Service Aware and Connect statuses based upon data from the callback', () => {

    initController();
    ctrl.$onInit();
    $scope.$apply();

    ctrl.onEntitlementChanges({
      callServiceAware: 'new data 01',
      callServiceConnect: 'new data 02',
    });

    expect(ctrl.callServiceAware).toBe('new data 01');
    expect(ctrl.callServiceConnect).toBe('new data 02');

  });

});
