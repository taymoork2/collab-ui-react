'use strict';

describe('SetupWizardCtrl', function () {
  beforeEach(module('Core'));
  beforeEach(module('Huron'));

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

  /**
   * convenience fn to see the proper ordering of setup tabs:
   * shows tab name, subtab name (if present), and [step names]
   *
  function print() {
    _.forEach($scope.tabs, function (macroStep) {
      var microSteps = _.map(macroStep.steps, 'name');
      if (microSteps.length !== 0) {
        console.log(macroStep.name, microSteps);
      } else {
        _.forEach(macroStep.subTabs, function (subTab) {
          var microSteps = _.map(subTab.steps, 'name');
          console.log(macroStep.name, subTab.name, microSteps);
        });
      }
    });
  }
  */

  describe('When all toggles are false (and Authinfo.isSetupDone is false as well)', function () {
    beforeEach(initController);

    it('the wizard should have 5 macro-level steps', function () {
      expectStepOrder(['planReview', 'messagingSetup', 'enterpriseSettings', 'addUsers', 'finish']);
    });

    it('planReview should have a single substep', function () {
      expectSubStepOrder('planReview', ['init']);
    });

    it('messagingSetup should have a single substep', function () {
      expectSubStepOrder('messagingSetup', ['setup']);
    });

    it('enterpriseSettings should have two subtabs', function () {
      expectSubTabOrder('enterpriseSettings', ['enterpriseSipUrl', 'enterpriseSSO']);
    });

    it('enterpriseSettings SSO subtab should have four substeps', function () {
      expectSubTabStepOrder('enterpriseSettings', 'enterpriseSSO', ['init', 'exportMetadata', 'importIdp', 'testSSO']);
    });

    it('enterpriseSettings sip url subtab should have one substep', function () {
      expectSubTabStepOrder('enterpriseSettings', 'enterpriseSipUrl', ['enterpriseSipUrl']);
    });

    it('addUsers should have 3 sub tabs with substeps having 4, 5, and 4 entries respectively', function () {
      var addUsers = _.find($scope.tabs, {
        name: 'addUsers'
      });
      expect(addUsers.steps).toBeUndefined();
      expectSubTabOrder('addUsers', ['simple', 'csv', 'advanced']);
      expectSubTabStepOrder('addUsers', 'simple', ['init', 'manualEntry', 'assignServices', 'assignDnAndDirectLines']);
      expectSubTabStepOrder('addUsers', 'csv', ['init', 'csvDownload', 'csvUpload', 'csvProcessing', 'csvResult']);
      expectSubTabStepOrder('addUsers', 'advanced', ['init', 'domainEntry', 'installConnector', 'syncStatus']);
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
      expectStepOrder(['planReview', 'messagingSetup', 'enterpriseSettings', 'addUsers']);
    });
  });

  describe('When Authinfo.isSquaredUC is true and addClaimSipUrl is false', function () {
    beforeEach(function () {
      Authinfo.isSquaredUC.and.returnValue(true);
      initController();
    });

    it('the wizard should have the 6 steps', function () {
      expectStepOrder(['planReview', 'serviceSetup', 'messagingSetup', 'enterpriseSettings', 'addUsers', 'finish']);
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

    it('the wizard should have 6 steps', function () {
      expectStepOrder(['planReview', 'serviceSetup', 'messagingSetup', 'enterpriseSettings', 'addUsers', 'finish']);
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

    it('the wizard should have 5 tabs', function () {
      expectStepOrder(['planReview', 'messagingSetup', 'enterpriseSettings', 'addUsers', 'finish']);
    });

    it('addUsers should have 2 sub steps - csv and advanced', function () {
      var addUsers = _.find($scope.tabs, {
        name: 'addUsers'
      });
      expect(addUsers.steps).toBeUndefined();
      expectSubTabOrder('addUsers', ['csv', 'advanced']);
      expectSubTabStepOrder('addUsers', 'csv', ['init', 'csvDownload', 'csvUpload', 'csvProcessing', 'csvResult']);
      expectSubTabStepOrder('addUsers', 'advanced', ['init', 'domainEntry', 'installConnector', 'syncStatus', 'dirsyncServices', 'dirsyncProcessing', 'dirsyncResult']);
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

    it('the wizard should have 5 tabs', function () {
      expectStepOrder(['planReview', 'messagingSetup', 'enterpriseSettings', 'addUsers', 'finish']);
    });
  });

  describe('When atlasTelstraCsb is enabled', function () {
    beforeEach(function () {
      FeatureToggleService.supports.and.callFake(function (val) {
        if (val === FeatureToggleService.features.atlasTelstraCsb) {
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
      expectSubTabOrder('enterpriseSettings', ['enterpriseSipUrl', 'enterpriseSSO']);
      expectSubTabStepOrder('enterpriseSettings', 'enterpriseSSO', ['init', 'exportMetadata', 'importIdp', 'testSSO']);
      expectSubTabStepOrder('enterpriseSettings', 'enterpriseSipUrl', ['enterpriseSipUrl']);
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

});
