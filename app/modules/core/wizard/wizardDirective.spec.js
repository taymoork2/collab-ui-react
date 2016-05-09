'use strict';

describe('Controller: WizardCtrl', function () {
  var controller, $scope, $state, $q, $translate, Authinfo, SessionStorage, $stateParams, tabs, Userservice, FeatureToggleService, rootScope;

  var getUserMe, getMyFeatureToggles;

  beforeEach(module('Huron'));
  beforeEach(module('Core'));

  tabs = [{
    name: 'planReview',
    label: 'firstTimeWizard.planReview',
    description: 'firstTimeWizard.planReviewSub',
    icon: 'icon-plan-review',
    title: 'firstTimeWizard.planReview',
    controller: 'PlanReviewCtrl as planReview',
    steps: [{
      name: 'init',
      template: 'modules/core/setupWizard/planReview.tpl.html'
    }]
  }, {
    name: 'messagingSetup',
    label: 'firstTimeWizard.messageSettings',
    description: 'firstTimeWizard.messagingSetupSub',
    icon: 'icon-convo',
    title: 'firstTimeWizard.messagingSetup',
    controller: 'MessagingSetupCtrl as msgSetup',
    steps: [{
      name: 'setup',
      template: 'modules/core/setupWizard/messagingSetup.tpl.html'
    }]
  }, {
    name: 'communications',
    label: 'firstTimeWizard.call',
    description: 'firstTimeWizard.communicationsSub',
    icon: 'icon-phone',
    title: 'firstTimeWizard.claimSipUrl',
    controller: 'CommunicationsCtrl as communicationsCtrl',
    steps: [{
      name: 'claimSipUrl',
      template: 'modules/core/setupWizard/claimSipUrl.tpl.html'
    }]
  }, {
    name: 'enterpriseSettings',
    label: 'firstTimeWizard.enterpriseSettings',
    description: 'firstTimeWizard.enterpriseSettingsSub',
    icon: 'icon-settings',
    title: 'firstTimeWizard.enterpriseSettings',
    controller: 'EnterpriseSettingsCtrl',
    steps: [{
      name: 'enterpriseSipUrl',
      template: 'modules/core/setupWizard/enterprise.setSipDomain.tpl.html'
    }, {
      name: 'init',
      template: 'modules/core/setupWizard/enterprise.init.tpl.html'
    }, {
      name: 'exportMetadata',
      template: 'modules/core/setupWizard/enterprise.exportMetadata.tpl.html'
    }, {
      name: 'importIdp',
      template: 'modules/core/setupWizard/enterprise.importIdp.tpl.html'
    }, {
      name: 'testSSO',
      template: 'modules/core/setupWizard/enterprise.testSSO.tpl.html'
    }]
  }, {
    name: 'addUsers',
    label: 'firstTimeWizard.addUsers',
    description: 'firstTimeWizard.addUsersSubDescription',
    icon: 'icon-add-users',
    title: 'firstTimeWizard.addUsers',
    controller: 'AddUserCtrl',
    subTabs: [{
      name: 'simple',
      title: 'firstTimeWizard.simple',
      steps: [{
        name: 'init',
        template: 'modules/core/setupWizard/addUsers.init.tpl.html'
      }, {
        name: 'manualEntry',
        template: 'modules/core/setupWizard/addUsers.manualEntry.tpl.html'
      }]
    }, {
      name: 'advanced',
      title: 'firstTimeWizard.advanced',
      steps: [{
        name: 'init',
        template: 'modules/core/setupWizard/addUsers.init.tpl.html'
      }, {
        name: 'domainEntry',
        template: 'modules/core/setupWizard/addUsers.domainEntry.tpl.html'
      }, {
        name: 'installConnector',
        template: 'modules/core/setupWizard/addUsers.installConnector.tpl.html'
      }, {
        name: 'syncStatus',
        template: 'modules/core/setupWizard/addUsers.syncStatus.tpl.html'
      }]
    }]
  }, {
    name: 'serviceSetup',
    label: 'firstTimeWizard.callSettings',
    description: 'firstTimeWizard.serviceSetupSub',
    icon: 'icon-tools',
    title: 'firstTimeWizard.unifiedCommunication',
    controller: 'ServiceSetupCtrl as squaredUcSetup',
    controllerAs: 'squaredUcSetup',
    steps: [{
      name: 'claimSipUrl',
      template: 'modules/core/setupWizard/claimSipUrl.tpl.html'
    }]
  }];

  beforeEach(inject(function ($rootScope, $controller, _$state_, _$q_, _$translate_, _Authinfo_, _SessionStorage_, $stateParams, _Userservice_, _FeatureToggleService_) {
    rootScope = $rootScope;
    $scope = rootScope.$new();
    Authinfo = _Authinfo_;
    $scope.tabs = tabs;
    $state = _$state_;
    $q = _$q_;
    $translate = _$translate_;
    SessionStorage = _SessionStorage_;
    Userservice = _Userservice_;
    FeatureToggleService = _FeatureToggleService_;

    getUserMe = getJSONFixture('core/json/users/me.json');
    getMyFeatureToggles = getJSONFixture('core/json/users/me/featureToggles.json');

    spyOn($state, 'go');
    spyOn(Userservice, 'getUser').and.returnValue(getUserMe);
    spyOn(FeatureToggleService, 'getFeatureForUser').and.returnValue(getMyFeatureToggles);
    spyOn(rootScope, '$broadcast').and.callThrough();

    controller = $controller('WizardCtrl', {
      $rootScope: rootScope,
      $scope: $scope,
      $translate: $translate,
      $stateParams: $stateParams,
      $state: $state
    });

    $scope.$apply();
  }));

  describe('WizardCtrl controller', function () {
    it('should be created successfully', function () {
      expect(controller).toBeDefined();
    });

  });

  describe('loadoverview', function () {
    it('should call state go', function () {
      controller.loadOverview();
      $scope.$apply();
      expect($state.go).toHaveBeenCalledWith("overview");
    });

  });

  describe('claimSipUriEvent', function () {
    it('should broadcast claimSipUriEvent from Communications Tab', function () {
      controller.setTab(_.find($scope.tabs, {
        name: 'communications',
      }));
      controller.nextStep();
      $scope.$apply();

      expect(rootScope.$broadcast).toHaveBeenCalledWith("wizard-claim-sip-uri-event");
    });

    it('should broadcast claimSipUriEvent from ServiceSetup Tab', function () {
      controller.setTab(_.find($scope.tabs, {
        name: 'serviceSetup',
      }));
      controller.nextStep();
      $scope.$apply();

      expect(rootScope.$broadcast).toHaveBeenCalledWith("wizard-claim-sip-uri-event");
    });

  });

});
