import moduleName from './index';

describe('SipDestinationSettingsSectionComponentCtrl', () => {

  let $componentController, $scope, $q, Authinfo, FeatureToggleService, USSService;

  beforeEach(angular.mock.module(moduleName));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  afterEach(cleanup);

  function dependencies (_$componentController_, _$q_, _$rootScope_, _Authinfo_, _FeatureToggleService_, _USSService_) {
    $componentController = _$componentController_;
    $scope = _$rootScope_.$new();
    $q = _$q_;
    Authinfo = _Authinfo_;
    FeatureToggleService = _FeatureToggleService_;
    USSService = _USSService_;
  }

  function initSpies() {
    spyOn(Authinfo, 'getOrgId').and.returnValue('1234');
    spyOn(FeatureToggleService, 'hasFeatureToggleOrIsTestOrg');
  }

  function cleanup() {
    $componentController = $scope = $q = Authinfo = FeatureToggleService = USSService = undefined;
  }

  function initController() {
    return $componentController('sipDestinationSettingsSection', {}, {});
  }

  describe('the SIP connectivity test tool', () => {

    it('should not show if you are neither a test org or nor have the feature toggle', () => {
      FeatureToggleService.hasFeatureToggleOrIsTestOrg.and.returnValue($q.resolve(false));
      const ctrl = initController();
      ctrl.$onInit();
      $scope.$apply();
      expect(ctrl.showSIPTestTool).toBeFalsy();
    });

    it('should show if you are a test org or if you have the feature toggle', () => {
      FeatureToggleService.hasFeatureToggleOrIsTestOrg.and.returnValue($q.resolve(true));
      const ctrl = initController();
      ctrl.$onInit();
      $scope.$apply();
      expect(ctrl.showSIPTestTool).toBeTruthy();
    });

  });

  describe('using USS to store data', () => {

    const expectedSipDomain = 'example.org';

    beforeEach(function () {
      FeatureToggleService.hasFeatureToggleOrIsTestOrg.and.returnValue($q.resolve(true));
      spyOn(USSService, 'getOrg').and.returnValue($q.resolve({
        sipDomain: expectedSipDomain,
      }));
      spyOn(USSService, 'updateOrg').and.returnValue($q.resolve());
    });

    it('should read data from USS on init', () => {
      const ctrl = initController();
      ctrl.$onInit();
      $scope.$apply();
      expect(USSService.getOrg.calls.count()).toBe(1);
      expect(ctrl.sipDomain).toBe(expectedSipDomain);
    });

    it('should save data in USS', () => {
      const newSipDomain = 'united.no';
      const ctrl = initController();
      ctrl.$onInit();
      ctrl.sipDomain = newSipDomain;
      ctrl.updateSipDomain();
      $scope.$apply();

      expect(USSService.updateOrg.calls.count()).toBe(1);
      expect(USSService.updateOrg).toHaveBeenCalledWith(jasmine.objectContaining({
        id: '1234',
        sipDomain: newSipDomain,
      }));
    });

  });

});
