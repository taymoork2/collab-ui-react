'use strict';

describe('directive: SetupDropdown, testing navigation changes', function () {
  var $compile, $rootScope, $q, Authinfo, FeatureToggleService, Orgservice;
  var $state, $translate, $timeout;
  var $controller, $scope, controller;
  var compiled;

  var usageFixture = getJSONFixture('core/json/organizations/usage.json');

  beforeEach(module('Core'));
  beforeEach(module('Huron'));
  beforeEach(module('Sunlight'));

  beforeEach(inject(function (_$controller_, _$compile_, _$rootScope_, _$q_, _Authinfo_, _FeatureToggleService_, _Orgservice_, _$translate_, _$state_, _$timeout_) {
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    $compile = _$compile_;
    Authinfo = _Authinfo_;
    FeatureToggleService = _FeatureToggleService_;
    Orgservice = _Orgservice_;
    $translate = _$translate_;
    $state = _$state_;
    $q = _$q_;
    $timeout = _$timeout_;
    $controller = _$controller_;

    spyOn(Authinfo, 'isCustomerAdmin').and.returnValue(true);
    spyOn(Authinfo, 'isSetupDone').and.returnValue(false);
    spyOn(Authinfo, 'isSquaredUC').and.returnValue(false);

    spyOn(FeatureToggleService, 'supports').and.returnValue($q.when(false));
    spyOn(FeatureToggleService, 'supportsDirSync').and.returnValue($q.when(false));

    spyOn(Orgservice, 'getAdminOrgUsage').and.returnValue($q.when(usageFixture));

    spyOn($state, 'go');

    compiled = $compile('<cr-setup-dropdown></cr-setup-dropdown>')($rootScope);
    controller = $controller('SetupWizardCtrl', {
      $scope: $scope
    });
  }));

  it('should initialize properly', function () {
    $rootScope.$digest();

    expect(compiled.html()).toContain($translate.instant('firstTimeWizard.planReview'));
  });

  it('should have valid state changes', function () {
    $rootScope.$digest();

    _.forEach($scope.tabs, function (tab) {
      var ahref = $(compiled).find('a:contains("' + $translate.instant(tab.label) + '")');
      ahref.click();
      $timeout.flush();
      expect($state.go).toHaveBeenCalledWith('setupwizardmodal', {
        currentTab: tab.name
      }, jasmine.any(Object));
    });
  });
});
