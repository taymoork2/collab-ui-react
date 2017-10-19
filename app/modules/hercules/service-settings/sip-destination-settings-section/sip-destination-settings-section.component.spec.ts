describe('SipDestinationSettingsSectionComponentCtrl', () => {

  let $componentController, $scope, $q, Authinfo, FeatureToggleService, Orgservice, USSService;

  beforeEach(angular.mock.module('Hercules'));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  afterEach(cleanup);

  function dependencies (_$componentController_, _$q_, _$rootScope_, _Authinfo_, _FeatureToggleService_, _Orgservice_, _USSService_) {
    $componentController = _$componentController_;
    $scope = _$rootScope_.$new();
    $q = _$q_;
    Authinfo = _Authinfo_;
    FeatureToggleService = _FeatureToggleService_;
    Orgservice = _Orgservice_;
    USSService = _USSService_;
  }

  function initSpies() {
    spyOn(Authinfo, 'getOrgId').and.returnValue('1234');
    spyOn(FeatureToggleService, 'supports');
    spyOn(Orgservice, 'isTestOrg');
  }

  function cleanup() {
    $componentController = $scope = $q = Authinfo = FeatureToggleService = Orgservice = USSService = undefined;
  }

  function initController() {
    return $componentController('sipDestinationSettingsSection', {}, {});
  }

  describe('the SIP connectivity test tool', () => {

    it('should not show if you are neither a test org or nor have the feature toggle', () => {
      FeatureToggleService.supports.and.returnValue($q.resolve(false));
      Orgservice.isTestOrg.and.returnValue($q.resolve(false));
      const ctrl = initController();
      ctrl.$onInit();
      $scope.$apply();
      expect(ctrl.showSIPTestTool).toBeFalsy();
    });

    it('should show if you are a test org', () => {
      FeatureToggleService.supports.and.returnValue($q.resolve(false));
      Orgservice.isTestOrg.and.returnValue($q.resolve(true));
      const ctrl = initController();
      ctrl.$onInit();
      $scope.$apply();
      expect(ctrl.showSIPTestTool).toBeTruthy();
    });

    it('should show if you have the feature toggle', () => {
      FeatureToggleService.supports.and.returnValue($q.resolve(true));
      Orgservice.isTestOrg.and.returnValue($q.resolve(false));
      const ctrl = initController();
      ctrl.$onInit();
      $scope.$apply();
      expect(ctrl.showSIPTestTool).toBeTruthy();
    });

  });

  describe('using USS to store data', () => {

    const expectedSipDomain = 'example.org';

    beforeEach(function () {
      FeatureToggleService.supports.and.returnValue($q.resolve(true));
      Orgservice.isTestOrg.and.returnValue($q.resolve(true));
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
