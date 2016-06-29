'use strict';

describe('SetupWizardCtrl', function () {
  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));

  var controller, $scope, $controller, Authinfo, $q, FeatureToggleService;

  beforeEach(inject(function ($rootScope, _$controller_, _$q_, _Authinfo_, _FeatureToggleService_) {
    $scope = $rootScope.$new();
    $q = _$q_;
    $controller = _$controller_;
    Authinfo = _Authinfo_;
    FeatureToggleService = _FeatureToggleService_;

    spyOn(Authinfo, 'isCustomerAdmin').and.returnValue(true);
    spyOn(Authinfo, 'isSetupDone').and.returnValue(false);
    spyOn(Authinfo, 'isSquaredUC').and.returnValue(false);
    spyOn(Authinfo, 'isCSB').and.returnValue(true);

    spyOn(FeatureToggleService, 'supports').and.returnValue($q.when(false));
    spyOn(FeatureToggleService, 'supportsDirSync').and.returnValue($q.when(false));
  }));

  function _expectStepIndex(step, index) {
    expect(_.findIndex($scope.tabs, {
      name: step
    })).toBe(index);
  }

  function _expectSubStepIndex(step, subStep, index) {
    expect(_.chain($scope.tabs)
      .find({
        name: step
      })
      .get('steps')
      .findIndex({
        name: subStep
      })
      .value()).toBe(index);
  }

  function _expectSubTabIndex(step, subTab, index) {
    expect(_.chain($scope.tabs)
      .find({
        name: step
      })
      .get('subTabs')
      .findIndex({
        name: subTab.name
      })
      .value()).toBe(index);
  }

  function _expectSubTabSubStepIndex(step, subTab, subStep, index) {
    expect(_.chain($scope.tabs)
      .find({
        name: step
      })
      .get('subTabs')
      .find({
        name: subTab
      })
      .get('steps')
      .findIndex({
        name: subStep.name
      })
      .value()).toBe(index);
  }

  function expectSubTabOrder(macroStep, subTabs) {
    // verify substeps length
    var subTabsVal = _.chain($scope.tabs)
      .find({
        name: macroStep
      })
      .get('subTabs')
      .value();

    expect(subTabsVal.length).toBe(subTabs.length);

    _.forEach(subTabsVal, function (subTab, index) {
      _expectSubTabIndex(macroStep, subTab, index);
    });
  }

  function expectSubTabStepOrder(macroStep, subTab, steps) {
    var stepsVal = _.chain($scope.tabs)
      .find({
        name: macroStep
      })
      .get('subTabs')
      .find({
        name: subTab
      })
      .get('steps')
      .value();

    expect(stepsVal.length).toBe(steps.length);

    _.forEach(stepsVal, function (step, index) {
      _expectSubTabSubStepIndex(macroStep, subTab, step, index);
    });
  }

  function expectStepOrder(steps) {
    expect($scope.tabs.length).toBe(steps.length);
    _.forEach(steps, function (step, index) {
      _expectStepIndex(step, index);
    });
  }

  function expectSubStepOrder(macroStep, subSteps) {
    // get the step
    var stepVal = _.find($scope.tabs, {
      name: macroStep
    });

    // verify substeps length
    expect(stepVal.steps.length).toBe(subSteps.length);

    // for each substep verify order
    _.forEach(subSteps, function (subStep, index) {
      _expectSubStepIndex(macroStep, subStep, index);
    });
  }

  function initController() {
    controller = $controller('SetupWizardCtrl', {
      $scope: $scope
    });
    $scope.$apply();
  }

  describe('When all toggles are false (and Authinfo.isSetupDone is false as well)', function () {
    beforeEach(initController);

    it('the wizard should have 4 macro-level steps', function () {
      expectStepOrder(['planReview', 'messagingSetup', 'enterpriseSettings', 'finish']);
    });

    it('planReview should have a single substep', function () {
      expectSubStepOrder('planReview', ['init']);
    });

    it('messagingSetup should have a single substep', function () {
      expectSubStepOrder('messagingSetup', ['setup']);
    });

    it('enterpriseSettings should have five steps', function () {
      expectSubStepOrder('enterpriseSettings', ['enterpriseSipUrl', 'init', 'exportMetadata', 'importIdp', 'testSSO']);
    });

    it('finish should have a single substep', function () {
      expectSubStepOrder('finish', ['init']);
    });
  });

  describe('When Authinfo.isSetupDone is true', function () {
    beforeEach(function () {
      Authinfo.isSetupDone.and.returnValue(true);
      initController();
    });

    it('the wizard should not have the finish step', function () {
      expectStepOrder(['planReview', 'messagingSetup', 'enterpriseSettings']);
    });
  });

  describe('When Authinfo.isSquaredUC is true and addClaimSipUrl is false', function () {
    beforeEach(function () {
      Authinfo.isSquaredUC.and.returnValue(true);
      initController();
    });

    it('the wizard should have the 5 steps', function () {
      expectStepOrder(['planReview', 'serviceSetup', 'messagingSetup', 'enterpriseSettings', 'finish']);
    });

    it('serviceSetup should have a single substep', function () {
      expectSubStepOrder('serviceSetup', ['init']);
    });
  });

  describe('When Authinfo.isSquaredUC is true and addClaimSipUrl is true', function () {
    beforeEach(function () {
      Authinfo.isSquaredUC.and.returnValue(true);
      FeatureToggleService.supports.and.callFake(function (val) {
        if (val === FeatureToggleService.features.atlasSipUriDomain) {
          return $q.when(true);
        }
        return $q.when(false);
      });
      initController();
    });

    it('the wizard should have 5 steps', function () {
      expectStepOrder(['planReview', 'serviceSetup', 'messagingSetup', 'enterpriseSettings', 'finish']);
    });

    it('serviceSetup should have a single substep', function () {
      expectSubStepOrder('serviceSetup', ['init']);
    });
  });

  describe('When dirsync is enabled', function () {
    beforeEach(function () {
      FeatureToggleService.supportsDirSync.and.returnValue($q.when(true));
      initController();
    });

    it('the wizard should have 4 tabs', function () {
      expectStepOrder(['planReview', 'messagingSetup', 'enterpriseSettings', 'finish']);
    });

  });

  describe('When Authinfo.isCSB is disabled', function () {
    beforeEach(function () {
      Authinfo.isCSB.and.returnValue(false);
      initController();
    });

    it('the wizard should have 5 tabs', function () {
      expectStepOrder(['planReview', 'messagingSetup', 'enterpriseSettings', 'addUsers', 'finish']);
    });

  });

  describe('When dirsync is enabled', function () {
    beforeEach(function () {
      FeatureToggleService.supports.and.callFake(function (val) {
        if (val === FeatureToggleService.features.atlasSipUriDomainEnterprise) {
          return $q.when(true);
        }
        return $q.when(false);
      });
      initController();
    });

    it('the wizard should have 4 tabs', function () {
      expectStepOrder(['planReview', 'messagingSetup', 'enterpriseSettings', 'finish']);
    });
  });

  describe('When everything is true', function () {
    beforeEach(function () {
      Authinfo.isSetupDone.and.returnValue(true);
      Authinfo.isSquaredUC.and.returnValue(true);

      FeatureToggleService.supports.and.returnValue($q.when(true));
      FeatureToggleService.supportsDirSync.and.returnValue($q.when(true));

      initController();
    });

    it('the wizard should have a lot of settings', function () {
      expectStepOrder(['planReview', 'serviceSetup', 'messagingSetup', 'enterpriseSettings']);
      expectSubStepOrder('planReview', ['init']);
      expectSubStepOrder('serviceSetup', ['init']);
      expectSubStepOrder('messagingSetup', ['setup']);
      expectSubStepOrder('enterpriseSettings', ['enterpriseSipUrl', 'init', 'exportMetadata', 'importIdp', 'testSSO']);
    });
  });

  it('will filter tabs if onlyShowSingleTab is true', function () {
    controller = $controller('SetupWizardCtrl', {
      $scope: $scope,
      $stateParams: {
        onlyShowSingleTab: true,
        currentTab: 'messagingSetup'
      }
    });
    $scope.$apply();

    expectStepOrder(['messagingSetup']);
  });

  it('will filter steps if onlyShowSingleTab is true and currentStep is set.', function () {
    controller = $controller('SetupWizardCtrl', {
      $scope: $scope,
      $stateParams: {
        currentTab: 'enterpriseSettings',
        currentStep: 'init',
        onlyShowSingleTab: true
      }
    });
    $scope.$apply();
    expectStepOrder(['enterpriseSettings']);
    expectSubStepOrder('enterpriseSettings', ['init', 'exportMetadata', 'importIdp', 'testSSO']);
  });

});
