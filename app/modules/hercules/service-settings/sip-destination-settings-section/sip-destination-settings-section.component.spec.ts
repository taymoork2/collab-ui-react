import moduleName from './index';

describe('SipDestinationSettingsSectionComponentCtrl', () => {

  let $componentController, $scope, $q, Authinfo, FeatureToggleService, HybridServicesClusterService, USSService;

  beforeEach(angular.mock.module(moduleName));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  afterEach(cleanup);

  function dependencies (_$componentController_, _$q_, _$rootScope_, _Authinfo_, _FeatureToggleService_, _HybridServicesClusterService_, _USSService_) {
    $componentController = _$componentController_;
    $scope = _$rootScope_.$new();
    $q = _$q_;
    Authinfo = _Authinfo_;
    FeatureToggleService = _FeatureToggleService_;
    HybridServicesClusterService = _HybridServicesClusterService_;
    USSService = _USSService_;
  }

  function initSpies() {
    spyOn(Authinfo, 'getOrgId').and.returnValue('1234');
    spyOn(FeatureToggleService, 'supports').and.returnValue($q.resolve(true));
    spyOn(HybridServicesClusterService, 'getAll').and.returnValue($q.resolve([]));
    spyOn(USSService, 'getOrg').and.returnValue($q.resolve({
      sipDomain: expectedSipDomain,
    }));
    spyOn(USSService, 'getSipDomainForClusters').and.returnValue($q.resolve([]));
    spyOn(USSService, 'updateOrg').and.returnValue($q.resolve());
  }

  function cleanup() {
    $componentController = $scope = $q = Authinfo = USSService = undefined;
  }

  function initController() {
    return $componentController('sipDestinationSettingsSection', {}, {});
  }

  const expectedSipDomain = 'example.org';

  it('should read data from USS on init', () => {
    const ctrl = initController();
    ctrl.$onInit();
    $scope.$apply();
    expect(USSService.getOrg.calls.count()).toBe(1);
    expect(ctrl.sipDomain).toBe(expectedSipDomain);
  });

  // TODO: move the following test to app/modules/hercules/sip-destination-input/sip-destination-input.component.spec.ts
  // it('should save data in USS', () => {
  //   const newSipDomain = 'united.no';
  //   const ctrl = initController();
  //   ctrl.$onInit();
  //   ctrl.sipDomain = newSipDomain;
  //   ctrl.updateSipDomain();
  //   $scope.$apply();

  //   expect(USSService.updateOrg.calls.count()).toBe(1);
  //   expect(USSService.updateOrg).toHaveBeenCalledWith(jasmine.objectContaining({
  //     id: '1234',
  //     sipDomain: newSipDomain,
  //   }));
  // });

});
