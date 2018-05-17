'use strict';

describe('Controller: AADecisionCtrl', function () {
  var featureToggleService;
  var aaCommonService;
  var autoAttendantHybridCareService;
  var aaQueueService;
  var controller;
  var AAUiModelService, AAModelService, AutoAttendantCeMenuModelService;
  var AASessionVariableService;
  var AACesOnboardHelperService;
  var customVarJson = getJSONFixture('huron/json/autoAttendant/aaCustomVariables.json');
  var $rootScope, $scope;

  var customSessionVarOptions = [
    'account_no',
    'cc_no',
    'q_123',
  ];

  var aaUiModel = {
    openHours: {},
  };
  var aaModel = {
    aaRecord: {
      scheduleId: '1',
      callExperienceName: 'AA1',
    },
    aaRecords: [{
      callExperienceURL: 'url-1/1111',
      callExperienceName: 'AA1',
    }, {
      callExperienceURL: 'url-2/1112',
      callExperienceName: 'AA2',
    }],
    aaRecordUUID: '1111',
    ceInfos: [],
  };
  var queue = [{
    queueName: 'queueyLewis',
    queueUrl: 'and/the/news',
  }];

  var schedule = 'openHours';
  var index = '0';
  var menu, action;
  var q;

  beforeEach(angular.mock.module('uc.autoattendant'));
  beforeEach(angular.mock.module('Huron'));

  beforeEach(inject(function ($controller, _$rootScope_, $q, _AAUiModelService_, _AAModelService_, _AASessionVariableService_, _AutoAttendantCeMenuModelService_, _FeatureToggleService_, _AACommonService_, _QueueHelperService_, _AutoAttendantHybridCareService_, _AACesOnboardHelperService_) {
    $rootScope = _$rootScope_;
    $scope = $rootScope;
    q = $q;

    schedule = 'openHours';
    index = '0';

    aaUiModel = {
      openHours: {},
    };

    aaModel = {
      aaRecord: {
        scheduleId: '1',
        callExperienceName: 'AA1',
      },
      aaRecords: [{
        callExperienceURL: 'url-1/1111',
        callExperienceName: 'AA1',
      }, {
        callExperienceURL: 'url-2/1112',
        callExperienceName: 'AA2',
      }],
      aaRecordUUID: '1111',
      ceInfos: [],
    };
    controller = $controller;

    featureToggleService = _FeatureToggleService_;
    aaCommonService = _AACommonService_;
    AACesOnboardHelperService = _AACesOnboardHelperService_;
    aaQueueService = _QueueHelperService_;
    AASessionVariableService = _AASessionVariableService_;
    autoAttendantHybridCareService = _AutoAttendantHybridCareService_;

    AAUiModelService = _AAUiModelService_;
    AAModelService = _AAModelService_;
    AutoAttendantCeMenuModelService = _AutoAttendantCeMenuModelService_;

    spyOn(AAUiModelService, 'getUiModel').and.returnValue(aaUiModel);
    spyOn(AAModelService, 'getAAModel').and.returnValue(aaModel);
    spyOn(featureToggleService, 'supports').and.returnValue($q.resolve(true));

    aaCommonService.resetFormStatus();

    AutoAttendantCeMenuModelService.clearCeMenuMap();
    aaUiModel.openHours = AutoAttendantCeMenuModelService.newCeMenu();

    menu = AutoAttendantCeMenuModelService.newCeMenuEntry();
    action = AutoAttendantCeMenuModelService.newCeActionEntry('conditional', '');
    action.if = {};
    menu.addAction(action);

    aaUiModel['openHours'].addEntryAt(0, menu);

    $scope.schedule = schedule;
    $scope.index = index;
  }));

  afterEach(function () {
    $rootScope = null;
    $scope = null;
    featureToggleService = null;
    AAUiModelService = null;
    AutoAttendantCeMenuModelService = null;
    aaCommonService = null;
    AASessionVariableService = null;
    controller = null;
    aaUiModel = null;
    menu = null;
    action = null;
    AACesOnboardHelperService = null;
    autoAttendantHybridCareService = null;
  });

  describe('Conditional tests', function () {
    beforeEach(inject(function () {
      spyOn(AASessionVariableService, 'getSessionVariables').and.returnValue(q.resolve(customVarJson));
    }));

    describe('activate', function () {
      beforeEach(inject(function () {
        spyOn(aaCommonService, 'isReturnedCallerToggle').and.returnValue(true);
        spyOn(AACesOnboardHelperService, 'isCesOnBoarded').and.returnValue(q.resolve({
          csOnboardingStatus: 'SUCCESS',
        }));
      }));


      it('should add decision action object menuEntry and have 6 if options and 5 then options', function () {
        var c;

        var menu = AutoAttendantCeMenuModelService.newCeMenuEntry();

        aaUiModel['openHours'].addEntryAt(0, menu);

        c = controller('AADecisionCtrl', {
          $scope: $scope,
        });

        $scope.$apply();

        expect(c.menuEntry.actions[0].name).toEqual('conditional');
        expect(c.isWarn).toEqual(false);
        expect(c.ifOptions.length).toEqual(7);
        expect(c.thenOptions.length).toEqual(5);
      });

      it('should not add sparkcall options when hybrid toggle is enabled and sparkCall is not configured', function () {
        var c;
        var menu = AutoAttendantCeMenuModelService.newCeMenuEntry();

        spyOn(autoAttendantHybridCareService, 'isSparkCallConfigured').and.returnValue(false);
        spyOn(aaCommonService, 'isHybridEnabledOnOrg').and.returnValue(true);
        aaUiModel['openHours'].addEntryAt(0, menu);

        c = controller('AADecisionCtrl', {
          $scope: $scope,
        });

        $scope.$apply();
        expect(c.thenOptions.length).toBe(3);
      });

      it('should add spark call options when hybrid toggle is enabled and sparkCall is also configured', function () {
        var c;
        var menu = AutoAttendantCeMenuModelService.newCeMenuEntry();
        spyOn(autoAttendantHybridCareService, 'isSparkCallConfigured').and.returnValue(true);
        spyOn(aaCommonService, 'isHybridEnabledOnOrg').and.returnValue(true);
        aaUiModel['openHours'].addEntryAt(0, menu);

        c = controller('AADecisionCtrl', {
          $scope: $scope,
        });

        $scope.$apply();
        expect(c.thenOptions.length).toBe(5);
      });
    });

    it('should add decision action object menuEntry', function () {
      var c;

      var menu = AutoAttendantCeMenuModelService.newCeMenuEntry();

      aaUiModel['openHours'].addEntryAt(0, menu);

      c = controller('AADecisionCtrl', {
        $scope: $scope,
      });

      $scope.$apply();

      expect(c.menuEntry.actions[0].name).toEqual('conditional');
      expect(c.isWarn).toEqual(false);
    });
    it('should set the If option ', function () {
      var c;

      action.if.leftCondition = 'Original-Remote-Party-ID';
      action.if.rightCondition = 'Hello world';

      c = controller('AADecisionCtrl', {
        $scope: $scope,
      });

      $scope.$apply();

      expect(c.ifOption.buffer).toEqual('Hello world');
      expect(c.isWarn).toEqual(false);
    });
    it('should set the then option ', function () {
      var c;
      action.if = {};
      action.if.leftCondition = 'Original-Remote-Party-ID';
      action.if.rightCondition = 'Hello world';

      action.then = {};

      action.then.name = 'goto';
      action.then.value = 'Demo AA';

      c = controller('AADecisionCtrl', {
        $scope: $scope,
      });

      $scope.$apply();

      expect(c.thenOption.value).toEqual('goto');
      expect(c.actionEntry.then.value).toEqual('Demo AA');
      expect(c.actionEntry.then.name).toEqual('goto');
      expect(c.isWarn).toEqual(false);
    });
    it('should set the action entry from the ifOption buffer', function () {
      var c;
      action.if = {};
      action.if.leftCondition = 'Original-Remote-Party-ID';
      action.if.rightCondition = 'Hello world';

      c = controller('AADecisionCtrl', {
        $scope: $scope,
      });

      $scope.$apply();

      var b = _.find(c.ifOptions, { value: 'Original-Remote-Party-ID' });
      b.buffer = 'Hello world';

      c.update('Original-Remote-Party-ID');

      expect(c.actionEntry.if.rightCondition).toEqual(b.buffer);
      expect(c.isWarn).toEqual(false);
    });

    it('should set the action entry from the ifOption buffer', function () {
      spyOn(aaCommonService, 'isReturnedCallerToggle').and.returnValue(true);
      spyOn(AACesOnboardHelperService, 'isCesOnBoarded').and.returnValue(q.resolve({
        csOnboardingStatus: 'SUCCESS',
      }));
      var c;
      action.if = {};
      action.if.leftCondition = 'callerReturned';
      action.if.rightCondition = 10080 * 60;

      c = controller('AADecisionCtrl', {
        $scope: $scope,
      });

      $scope.$apply();

      var b = _.find(c.ifOptions, { value: 'callerReturned' });
      b.buffer = {
        label: 'test',
        value: 10080 * 60,
      };

      c.update('callerReturned');

      expect(c.actionEntry.if.rightCondition).toEqual(b.buffer.value);
      expect(c.isWarn).toEqual(false);
    });

    it('should returnCallerToggle to false when ces onboarding is initializing', function () {
      spyOn(aaCommonService, 'isReturnedCallerToggle').and.returnValue(true);
      // In case when return caller toggle is true and ces onboarding is on initializing state
      spyOn(AACesOnboardHelperService, 'isCesOnBoarded').and.returnValue(q.resolve({
        csOnboardingStatus: 'INITIALZING',
      }));
      var ctrl;

      ctrl = controller('AADecisionCtrl', {
        $scope: $scope,
      });

      $scope.$apply();
      expect(ctrl.returnedCallerToggle).toEqual(false);
    });

    it('should set returnCallerToggle to false when ces onboarding is successful but returnCaller toggle is false', function () {
      spyOn(aaCommonService, 'isReturnedCallerToggle').and.returnValue(false);
      spyOn(AACesOnboardHelperService, 'isCesOnBoarded').and.returnValue(q.resolve({
        csOnboardingStatus: 'SUCCESS',
      }));
      var ctrl;

      ctrl = controller('AADecisionCtrl', {
        $scope: $scope,
      });

      $scope.$apply();
      expect(ctrl.returnedCallerToggle).toEqual(false);
    });

    it('should the conditional from ifOption value', function () {
      var c;
      action.if = {};
      action.if.leftCondition = 'Original-Remote-Party-ID';
      action.if.rightCondition = 'Hello world';

      c = controller('AADecisionCtrl', {
        $scope: $scope,
      });

      $scope.$apply();

      c.ifOption.value = 'Original-Remote-Party-ID';
      c.ifOption.buffer = 'Hello World';

      c.setIfDecision();

      expect(c.actionEntry.if.rightCondition).toEqual(c.ifOption.buffer);
      expect(c.actionEntry.if.leftCondition).toEqual(c.ifOption.value);
      expect(c.isWarn).toEqual(false);
    });

    it('should set the caller returned conditional from ifOption value', function () {
      var c;
      action.if = {};
      action.if.leftCondition = 'callerReturned';
      action.if.rightCondition = 10080 * 60;

      c = controller('AADecisionCtrl', {
        $scope: $scope,
      });

      $scope.$apply();

      c.ifOption.value = 'callerReturned';
      c.ifOption.buffer = {
        label: 'test',
        value: 10080 * 60,
      };

      c.setIfDecision();

      expect(c.actionEntry.if.rightCondition).toEqual(c.ifOption.buffer.value);
      expect(c.actionEntry.if.leftCondition).toEqual(c.ifOption.value);
      expect(c.isWarn).toEqual(false);
    });

    it('set the custom Variable  conditional from ifOption value', function () {
      var c;
      action.if = {};
      action.if.leftCondition = 'custVar1';
      action.if.rightCondition = 'Hello world';

      c = controller('AADecisionCtrl', {
        $scope: $scope,
      });

      $scope.$apply();

      c.ifOption.value = 'sessionVariable';
      c.ifOption.buffer = 'Hello World';

      c.setIfDecision();

      expect(c.actionEntry.if.rightCondition).toEqual(c.ifOption.buffer);
      expect(c.isWarn).toEqual(true);
    });

    it('should not warn when left condition is empty', function () {
      var c;
      action.if = {};
      action.if.leftCondition = '';
      action.if.rightCondition = 'Hello world';

      c = controller('AADecisionCtrl', {
        $scope: $scope,
      });

      $scope.$apply();

      c.ifOption.value = 'sessionVariable';
      c.ifOption.buffer = '';

      c.setIfDecision();

      expect(c.isWarn).toEqual(false);
    });

    it('should add in new variable (added via callerInput)', function () {
      var c;

      c = controller('AADecisionCtrl', {
        $scope: $scope,
      });

      $scope.$apply();

      c.ui = {};
      c.ui.openHours = AutoAttendantCeMenuModelService.newCeMenu();

      var menuOpen = AutoAttendantCeMenuModelService.newCeMenuEntry();

      c.ui.openHours.addEntryAt(index, menuOpen);
      var action = AutoAttendantCeMenuModelService.newCeActionEntry('runActionsOnInput', '');
      action.variableName = 'my variable one';
      menuOpen.addAction(action);

      c.refreshVarSelects();

      expect(c.sessionVarOptions.length).toEqual(2);
      expect(c.sessionVarOptions[1]).toEqual('my variable one');
    });
    it('should not add in new ifOption when it is already there.', function () {
      var c;

      c = controller('AADecisionCtrl', {
        $scope: $scope,
      });

      $scope.$apply();

      c.ui = {};
      c.ui.openHours = AutoAttendantCeMenuModelService.newCeMenu();

      var menuOpen = AutoAttendantCeMenuModelService.newCeMenuEntry();

      c.ui.openHours.addEntryAt(index, menuOpen);
      var action = AutoAttendantCeMenuModelService.newCeActionEntry('runActionsOnInput', '');
      action.variableName = 'my variable one';
      menuOpen.addAction(action);

      c.refreshIfSelects();

      expect(c.ifOptions.length).toEqual(6);
      expect(c.ifOptions[c.ifOptions.length - 1].value).toMatch('sessionVariable');
    });
  });
  describe('No SessionVars  Conditional tests', function () {
    beforeEach(inject(function () {
      spyOn(AASessionVariableService, 'getSessionVariables').and.returnValue(q.resolve([]));
    }));

    it('should add in new variable with session object added (added via callerInput)', function () {
      var c;

      c = controller('AADecisionCtrl', {
        $scope: $scope,
      });

      $scope.$apply();

      c.ui = {};
      c.ui.openHours = AutoAttendantCeMenuModelService.newCeMenu();

      var menuOpen = AutoAttendantCeMenuModelService.newCeMenuEntry();

      c.ui.openHours.addEntryAt(index, menuOpen);
      var action = AutoAttendantCeMenuModelService.newCeActionEntry('runActionsOnInput', '');
      action.variableName = 'my variable one';
      menuOpen.addAction(action);

      c.refreshIfSelects();

      expect(c.sessionVarOptions.length).toEqual(1);
      expect(c.sessionVarOptions[0]).toEqual('my variable one');
      expect(c.ifOptions.length).toEqual(6);
      expect(c.ifOptions[c.ifOptions.length - 1].value).toMatch('sessionVariable');
    });
  });

  /* No support for queueing */

  xdescribe('list Queues', function () {
    beforeEach(inject(function ($q) {
      spyOn(aaQueueService, 'listQueues').and.returnValue($q.resolve(queue));
    }));

    it('should add the Queue option to the dropdown', function () {
      var c, action;
      var menu = AutoAttendantCeMenuModelService.newCeMenuEntry();
      action = AutoAttendantCeMenuModelService.newCeActionEntry('conditional', '');

      action.if = {};

      action.if.leftCondition = 'Original-Remote-Party-ID';
      action.if.rightCondition = 'Hello world';

      menu.addAction(action);

      aaUiModel['openHours'].addEntryAt(index, menu);

      c = controller('AADecisionCtrl', {
        $scope: $scope,
      });

      $scope.$apply();
      var routeToQ = _.find(c.thenOptions, { value: 'routeToQueue' });

      expect(routeToQ).toBeDefined();

      expect(c.queues[0].description).toEqual('queueyLewis');
      expect(c.queues[0].id).toEqual('news');
    });
  });

  describe('Warning Warning Warning', function () {
    beforeEach(inject(function () {
      spyOn(AASessionVariableService, 'getSessionVariables').and.returnValue(q.resolve([]));
    }));

    it('should set the warning flag and add in the sessionVariable when missing custom variable', function () {
      var c;
      action.if = {};
      action.if.leftCondition = 'Some Random custom variable';

      c = controller('AADecisionCtrl', {
        $scope: $scope,
      });

      $scope.$apply();

      var b = _.find(c.ifOptions, { value: 'sessionVariable' });
      expect(b).toBeDefined();

      expect(c.isWarn).toEqual(true);
    });
  });
  describe('Variable is deleted', function () {
    beforeEach(inject(function () {
      spyOn(AASessionVariableService, 'getSessionVariables').and.returnValue(q.resolve([]));
      spyOn(AASessionVariableService, 'getSessionVariablesOfDependentCeOnly').and.returnValue(q.resolve());
      spyOn(aaCommonService, 'collectThisCeActionValue').and.returnValue([]);
    }));

    it('should delete variable from session array', function () {
      var c;
      action.if = {};
      action.if.leftCondition = 'Some Random custom variable';

      c = controller('AADecisionCtrl', {
        $scope: $scope,
      });
      c.sessionVarOptions.push('One');

      $rootScope.$broadcast('CE Updated');

      $scope.$apply();

      expect(c.sessionVarOptions.length).toEqual(0);
    });
  });

  describe('Input caller variable is changed', function () {
    beforeEach(inject(function () {
      spyOn(AASessionVariableService, 'getSessionVariables').and.returnValue(q.resolve(customSessionVarOptions));
    }));
    it('should test caller input field change with warning set to false as valid caller input entered', function () {
      var c;
      var broadcastArgument = 'callerInputOldValue';
      c = controller('AADecisionCtrl', {
        $scope: $scope,
      });
      $scope.$apply();
      c.sessionVarOption = 'account_no';
      $rootScope.$broadcast('CIVarNameChanged', broadcastArgument);
      expect(c.isWarn).toEqual(false);
    });

    it('should test caller input field change with warning set to true as non existent caller input entered', function () {
      var c;
      var broadcastArgument = 'callerInputOldValue';
      c = controller('AADecisionCtrl', {
        $scope: $scope,
      });
      $scope.$apply();
      c.sessionVarOption = 'non_existent_caller_input';
      $rootScope.$broadcast('CIVarNameChanged', broadcastArgument);
      expect(c.isWarn).toEqual(true);
    });
  });
});
