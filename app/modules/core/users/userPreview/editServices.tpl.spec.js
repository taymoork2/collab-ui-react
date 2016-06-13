'use strict';

describe('Template: editServices', function () {
  var $compile, $q, $scope, $templateCache, $controller, controller;
  var Orgservice, TelephonyInfoService, DialPlanService, Userservice, FeatureToggleService, CsvDownloadService;
  var internalNumbers, externalNumbers, externalNumberPool, externalNumberPoolMap, getUserMe;
  var getMigrateUsers, getMyFeatureToggles, sites, fusionServices, headers, getMessageServices;
  var view;

  var SAVE_BUTTON = '#btnSaveEnt';

  beforeEach(module('Core'));
  beforeEach(module('Hercules'));
  beforeEach(module('Huron'));
  beforeEach(module('Messenger'));
  beforeEach(inject(dependencies));
  beforeEach(initDependencySpies);
  beforeEach(compileView);
  beforeEach(initSpies);

  function dependencies(_$compile_, $rootScope, _$q_, _$templateCache_, _$controller_, _Userservice_, _TelephonyInfoService_, _Orgservice_, _FeatureToggleService_, _DialPlanService_, _CsvDownloadService_) {
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
    spyOn(FeatureToggleService, 'atlasCareTrialsGetStatus').and.returnValue($q.when(true));
    spyOn(TelephonyInfoService, 'getPrimarySiteInfo').and.returnValue($q.when(sites));

    spyOn(Userservice, 'onboardUsers');
    spyOn(Userservice, 'bulkOnboardUsers');
    spyOn(Userservice, 'updateUsers');
  }

  function initSpies() {
    spyOn($scope, 'editServicesSave');
  }

  function compileView() {
    controller = $controller('OnboardCtrl', {
      $scope: $scope
    });

    var template = $templateCache.get('modules/core/users/userPreview/editServices.tpl.html');
    view = $compile(angular.element(template))($scope);
    $scope.$apply();
  }

  describe('Save button', function () {
    it('should call editServicesSave() on click', function () {
      view.find(SAVE_BUTTON).click();
      expect($scope.editServicesSave).toHaveBeenCalled();
    });
  });
});
