'use strict';

describe('Controller: AADecisionCtrl', function () {
  var featureToggleService;
  var aaCommonService;
  var aaQueueService;
  var controller;
  var AAUiModelService, AAModelService, AutoAttendantCeMenuModelService;
  var customVariableService;
  var customVarJson = getJSONFixture('huron/json/autoAttendant/aaCustomVariables.json');

  var $rootScope, $scope;

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
    queueName: "queueyLewis",
    queueUrl: "and/the/news",
  }];

  var schedule = 'openHours';
  var index = '0';
  var menu, action;

  beforeEach(angular.mock.module('uc.autoattendant'));
  beforeEach(angular.mock.module('Huron'));

  beforeEach(inject(function ($controller, _$rootScope_, $q, _AAUiModelService_, _AAModelService_, _CustomVariableService_, _AutoAttendantCeMenuModelService_, _FeatureToggleService_, _AACommonService_, _QueueHelperService_) {

    $rootScope = _$rootScope_;
    $scope = $rootScope;

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
    aaQueueService = _QueueHelperService_;
    customVariableService = _CustomVariableService_;

    AAUiModelService = _AAUiModelService_;
    AAModelService = _AAModelService_;
    AutoAttendantCeMenuModelService = _AutoAttendantCeMenuModelService_;

    spyOn(AAUiModelService, 'getUiModel').and.returnValue(aaUiModel);
    spyOn(AAModelService, 'getAAModel').and.returnValue(aaModel);
    spyOn(featureToggleService, 'supports').and.returnValue($q.resolve(true));
    spyOn(customVariableService, 'listCustomVariables').and.returnValue($q.resolve(customVarJson));

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
    controller = null;
    aaUiModel = null;
    menu = null;
    action = null;

  });

  describe('add conditional action', function () {
    it('should add decision action object menuEntry', function () {
      var c;

      var menu = AutoAttendantCeMenuModelService.newCeMenuEntry();

      aaUiModel['openHours'].addEntryAt(0, menu);

      c = controller('AADecisionCtrl', {
        $scope: $scope,
      });

      $scope.$apply();

      expect(c.menuEntry.actions[0].name).toEqual('conditional');
    });
  });
  describe('add If ', function () {
    it('should set the If option ', function () {
      var c;

      action.if.leftCondition = 'Original-Remote-Party-ID';
      action.if.rightCondition = 'Hello world';

      c = controller('AADecisionCtrl', {
        $scope: $scope,
      });

      $scope.$apply();

      expect(c.ifOption.buffer).toEqual('Hello world');

    });
  });
  describe('add then ', function () {
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

    });
  });
  describe('update', function () {
    it('should set the action entry from the ifOption buffer', function () {
      var c;
      action.if = {};
      action.if.leftCondition = 'Original-Remote-Party-ID';
      action.if.rightCondition = 'Hello world';

      c = controller('AADecisionCtrl', {
        $scope: $scope,
      });

      $scope.$apply();

      var b = _.find(c.ifOptions, { 'value': 'Original-Remote-Party-ID' });
      b.buffer = "Hello world";

      c.update('Original-Remote-Party-ID');

      expect(c.actionEntry.if.rightCondition).toEqual(b.buffer);

    });
  });
  describe('set IfDecision', function () {
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

    });
    it('custom Variable  conditional from ifOption value', function () {
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
    });
  });

  /* No support for queueing */

  xdescribe('list Queues', function () {
    beforeEach(inject(function ($q) {
      spyOn(aaQueueService, 'listQueues').and.returnValue($q.resolve(queue));
      aaCommonService.setRouteQueueToggle(true);
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
      var routeToQ = _.find(c.thenOptions, { 'value': 'routeToQueue' });

      expect(routeToQ).toBeDefined();

      expect(c.queues[0].description).toEqual("queueyLewis");
      expect(c.queues[0].id).toEqual("news");
    });
  });

});
