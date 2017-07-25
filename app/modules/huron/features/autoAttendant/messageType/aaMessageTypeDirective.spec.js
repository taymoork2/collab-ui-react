'use strict';

describe('Directive: aaMessageType', function () {
  var $compile, $rootScope, $scope, $controller;
  var element;
  var q;
  var schedule = 'openHours';
  var index = 0;

  var AAUiModelService, AutoAttendantCeMenuModelService, AASessionVariableService, AAModelService;
  var customVarJson = getJSONFixture('huron/json/autoAttendant/aaCustomVariables.json');

  var aaUiModel = {
    openHours: {},
    ceInfo: {
      name: 'aa',
    },
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

  afterEach(function () {
    if (element) {
      element.remove();
    }
    element = undefined;
  });

  beforeEach(angular.mock.module('Huron'));

  beforeEach(inject(function (_$controller_, _$compile_, _$rootScope_, $q, _AAUiModelService_, _AutoAttendantCeMenuModelService_, _AASessionVariableService_, _AAModelService_) {
    var menuEntry;
    q = $q;

    $compile = _$compile_;
    $rootScope = _$rootScope_;
    $scope = $rootScope;
    $controller = _$controller_;
    $scope.schedule = schedule;
    $scope.index = index;

    AAUiModelService = _AAUiModelService_;
    AutoAttendantCeMenuModelService = _AutoAttendantCeMenuModelService_;
    AASessionVariableService = _AASessionVariableService_;
    AAModelService = _AAModelService_;

    menuEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
    menuEntry.addAction(AutoAttendantCeMenuModelService.newCeActionEntry('runActionsOnInput', 'http://www.test.com'));

    spyOn(AAUiModelService, 'getUiModel').and.returnValue(aaUiModel);
    spyOn(AASessionVariableService, 'getSessionVariablesOfDependentCeOnly').and.returnValue(q.resolve(customVarJson));
    spyOn(AAModelService, 'getAAModel').and.returnValue(aaModel);
    aaUiModel.openHours = AutoAttendantCeMenuModelService.newCeMenu();
    aaUiModel.openHours.addEntryAt(0, menuEntry);
  }));

  it('creates the appropriate content as element', function () {
    element = $compile("<aa-message-type aa-schedule='openHours' aa-index='0' name='messageType'></aa-message-type>")($rootScope);
    $rootScope.$digest();
    expect(element.html()).toContain('messageType');
  });

  describe('varible warning', function () {
    it('fullWarningMsg', function () {
      var controller = $controller('AAMessageTypeCtrl', {
        $scope: $scope,
      });
      controller.fullWarningMsg();
      expect(controller.fullWarningMsgValue).toEqual(true);
    });
    it('getWarning returning true', function () {
      var controller = $controller('AAMessageTypeCtrl', {
        $scope: $scope,
      });
      controller.deletedSessionVariablesList = ['test', 'test2'];
      controller.getWarning();
      spyOn(controller, 'getWarning').and.returnValue(true);
    });
    it('getWarning returning true', function () {
      var controller = $controller('AAMessageTypeCtrl', {
        $scope: $scope,
      });
      controller.getWarning();
      spyOn(controller, 'getWarning').and.returnValue(false);
    });
    it('boradcase of CE Updated', function () {
      //var actionEntry = AutoAttendantCeMenuModelService.newCeActionEntry('Chandan Test Queue', 'c16a6027-caef-4429-b3af-9d61ddc7964b');
      var menuEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
      menuEntry.dynamicList = [{
        say: {
          value: 'testValue',
          voice: '',
          as: 'testValue',
        },
        isDynamic: true,
      }];
      menuEntry.addAction(AutoAttendantCeMenuModelService.newCeActionEntry('runActionsOnInput', 'http://www.test.com'));
      aaUiModel.openHours.addEntryAt(0, menuEntry);
      var controller = $controller('AAMessageTypeCtrl', {
        $scope: $scope,
      });
      $scope.$apply();
      controller.deletedSessionVariablesList = [];
      $rootScope.$broadcast('CE Updated');
      controller.getWarning();
    });
    it('boradcase of CIVarNameChanged', function () {
      //var actionEntry = AutoAttendantCeMenuModelService.newCeActionEntry('Chandan Test Queue', 'c16a6027-caef-4429-b3af-9d61ddc7964b');
      var menuEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
      $scope.fromDecision = true;
      menuEntry.dynamicList = [{
        say: {
          value: 'testValue',
          voice: '',
          as: 'testValue',
        },
        isDynamic: true,
      }];
      AutoAttendantCeMenuModelService.clearCeMenuMap();
      aaUiModel[schedule] = AutoAttendantCeMenuModelService.newCeMenu();
      aaUiModel[schedule].addEntryAt(index, AutoAttendantCeMenuModelService.newCeMenuEntry());
      var action = AutoAttendantCeMenuModelService.newCeActionEntry('conditional', '');
      action.queueSettings = {};
      aaUiModel[schedule].entries[index].actions[0] = action;
      menuEntry.addAction(AutoAttendantCeMenuModelService.newCeActionEntry('runActionsOnInput', 'http://www.test.com'));
      aaUiModel[schedule].addEntryAt(index, menuEntry);
      var controller = $controller('AAMessageTypeCtrl', {
        $scope: $scope,
      });
      $scope.$apply();
      $rootScope.$broadcast('CIVarNameChanged');
      controller.getWarning();
    });
  });
});
