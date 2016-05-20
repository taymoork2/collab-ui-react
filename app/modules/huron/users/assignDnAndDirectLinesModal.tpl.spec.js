'use strict';

describe('Template: assignDnAndDirectLinesModal', function () {
  var $compile, $q, $scope, $templateCache, $controller, controller;
  var Orgservice, TelephonyInfoService, DialPlanService, Userservice, FeatureToggleService, CsvDownloadService;
  var internalNumbers, externalNumbers, externalNumberPool, externalNumberPoolMap, getUserMe;
  var getMigrateUsers, getMyFeatureToggles, sites, fusionServices, headers, getMessageServices;
  var view;

  var ONBOARD_BUTTON = '#btnOnboard';
  var CONVERT_BUTTON = '#btnConvert';
  var EDIT_SERVICES_BUTTON = '#btnEditServices';

  beforeEach(module('Core'));
  beforeEach(module('Hercules'));
  beforeEach(module('Huron'));
  beforeEach(module('Messenger'));
  beforeEach(inject(dependencies));
  beforeEach(initDependencySpies);
  beforeEach(compileView);
  beforeEach(initSpies);

  function dependencies(_$compile_, $rootScope, _$q_, _$templateCache_, _$controller_, _Notification_, _Userservice_, _TelephonyInfoService_, _Orgservice_, _FeatureToggleService_, _DialPlanService_, _SyncService_, _Authinfo_, _CsvDownloadService_) {
    $compile = _$compile_;
    $scope = $rootScope.$new();
    $templateCache = _$templateCache_;
    $controller = _$controller_;
    $q = _$q_;

    DialPlanService = _DialPlanService_;
    Userservice = _Userservice_;
    Orgservice = _Orgservice_;
    TelephonyInfoService = _TelephonyInfoService_;
    FeatureToggleService = _FeatureToggleService_;
    CsvDownloadService = _CsvDownloadService_;
  }

  function initDependencySpies() {
    internalNumbers = getJSONFixture('huron/json/internalNumbers/internalNumbers.json');
    externalNumbers = getJSONFixture('huron/json/externalNumbers/externalNumbers.json');
    externalNumberPool = getJSONFixture('huron/json/externalNumberPoolMap/externalNumberPool.json');
    externalNumberPoolMap = getJSONFixture('huron/json/externalNumberPoolMap/externalNumberPoolMap.json');
    getUserMe = getJSONFixture('core/json/users/me.json');
    getMigrateUsers = getJSONFixture('core/json/users/migrate.json');
    getMyFeatureToggles = getJSONFixture('core/json/users/me/featureToggles.json');
    sites = getJSONFixture('huron/json/settings/sites.json');
    fusionServices = getJSONFixture('core/json/authInfo/fusionServices.json');
    headers = getJSONFixture('core/json/users/headers.json');
    getMessageServices = getJSONFixture('core/json/authInfo/messagingServices.json');

    spyOn(Orgservice, 'getHybridServiceAcknowledged').and.returnValue($q.when(fusionServices));
    spyOn(CsvDownloadService, 'getCsv').and.callFake(function (type) {
      if (type === 'headers') {
        return $q.when(headers);
      } else {
        return $q.when({});
      }
    });
    spyOn(Orgservice, 'getUnlicensedUsers');

    spyOn(TelephonyInfoService, 'getInternalNumberPool').and.returnValue(internalNumbers);
    spyOn(TelephonyInfoService, 'loadInternalNumberPool').and.returnValue($q.when(internalNumbers));
    spyOn(TelephonyInfoService, 'getExternalNumberPool').and.returnValue(externalNumbers);
    spyOn(DialPlanService, 'getCustomerDialPlanDetails').and.returnValue($q.when({
      extensionGenerated: 'false'
    }));
    spyOn(TelephonyInfoService, 'loadExternalNumberPool').and.returnValue($q.when(externalNumbers));
    spyOn(TelephonyInfoService, 'loadExtPoolWithMapping').and.returnValue($q.when(externalNumberPoolMap));

    spyOn(FeatureToggleService, 'getFeaturesForUser').and.returnValue(getMyFeatureToggles);
    spyOn(FeatureToggleService, 'supportsDirSync').and.returnValue($q.when(false));
    spyOn(TelephonyInfoService, 'getPrimarySiteInfo').and.returnValue($q.when(sites));

    spyOn(Userservice, 'onboardUsers');
    spyOn(Userservice, 'bulkOnboardUsers');
    spyOn(Userservice, 'updateUsers');
  }

  function initSpies() {
    spyOn($scope, 'updateUserLicense');
  }

  function compileView() {
    controller = $controller('OnboardCtrl', {
      $scope: $scope
    });

    var template = $templateCache.get('modules/huron/users/assignDnAndDirectLinesModal.tpl.html');
    view = $compile(angular.element(template))($scope);
    $scope.$apply();
  }

  describe('Onboard Flow', function () {
    beforeEach(initOnboardFlow);

    it('should show the onboard button', expectButtonToExist(ONBOARD_BUTTON, true));
    it('should not show the convert button', expectButtonToExist(CONVERT_BUTTON, false));
    it('should not show the edit services button', expectButtonToExist(EDIT_SERVICES_BUTTON, false));
  });

  describe('Convert Flow', function () {
    beforeEach(initConvertFlow);

    it('should not show the onboard button', expectButtonToExist(ONBOARD_BUTTON, false));
    it('should show the convert button', expectButtonToExist(CONVERT_BUTTON, true));
    it('should not show the edit services button', expectButtonToExist(EDIT_SERVICES_BUTTON, false));
  });

  describe('Edit Services Flow', function () {
    beforeEach(initEditServicesFlow);

    it('should not show the onboard button', expectButtonToExist(ONBOARD_BUTTON, false));
    it('should not show the convert button', expectButtonToExist(CONVERT_BUTTON, false));
    it('should show the edit services button', expectButtonToExist(EDIT_SERVICES_BUTTON, true));
    it('should call updateUserLicense() on click', function () {
      view.find(EDIT_SERVICES_BUTTON).click();
      expect($scope.updateUserLicense).toHaveBeenCalled();
    });
  });

  function expectButtonToExist(button, shouldExist) {
    return function () {
      expect(view.find(button).length).toBe(shouldExist ? 1 : 0);
    };
  }

  function initOnboardFlow() {
    $scope.convertUsersFlow = false;
    $scope.editServicesFlow = false;
    $scope.$apply();
  }

  function initConvertFlow() {
    $scope.convertUsersFlow = true;
    $scope.editServicesFlow = false;
    $scope.$apply();
  }

  function initEditServicesFlow() {
    $scope.convertUsersFlow = false;
    $scope.editServicesFlow = true;
    $scope.$apply();
  }
});
