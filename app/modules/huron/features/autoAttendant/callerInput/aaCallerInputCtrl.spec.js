'use strict';

describe('Controller: AACallerInputCtrl', function () {
  var featureToggleService;
  var aaLanguageService;
  var aaCommonService;

  var controller;
  var AAUiModelService, AutoAttendantCeMenuModelService;
  var $rootScope, $scope;

  var customVariableService;
  var customVarJson = getJSONFixture('huron/json/autoAttendant/aaCustomVariables.json');

  var aaUiModel = {
    openHours: {},
  };
  var inputActions = [{
    key: '1',
    value: '',
    keys: [
      '0', '1', '4', '5', '6', '7', '8', '9', '#', '*',
    ],
  }, {
    key: '2',
    value: '',
    keys: [
      '0', '2', '4', '5', '6', '7', '8', '9', '#', '*',
    ],
  }, {
    key: '3',
    value: '',
    keys: [
      '0', '3', '4', '5', '6', '7', '8', '9', '#', '*',
    ],
  }];

  var schedule = 'openHours';
  var index = '0';
  var menuId = 'menu1';

  beforeEach(angular.mock.module('uc.autoattendant'));
  beforeEach(angular.mock.module('Huron'));

  beforeEach(inject(function ($controller, _$rootScope_, $q, _AAUiModelService_, _AutoAttendantCeMenuModelService_, _CustomVariableService_, _FeatureToggleService_, _AALanguageService_, _AACommonService_) {
    $rootScope = _$rootScope_;
    $scope = $rootScope;

    schedule = 'openHours';
    index = '0';
    menuId = 'menu1';

    aaUiModel = {
      openHours: {},
    };

    featureToggleService = _FeatureToggleService_;
    aaLanguageService = _AALanguageService_;
    aaCommonService = _AACommonService_;
    customVariableService = _CustomVariableService_;

    AAUiModelService = _AAUiModelService_;
    AutoAttendantCeMenuModelService = _AutoAttendantCeMenuModelService_;

    spyOn(AAUiModelService, 'getUiModel').and.returnValue(aaUiModel);
    spyOn(featureToggleService, 'supports').and.returnValue($q.resolve(true));
    spyOn(customVariableService, 'listCustomVariables').and.returnValue($q.resolve(customVarJson));


    AutoAttendantCeMenuModelService.clearCeMenuMap();
    aaUiModel.openHours = AutoAttendantCeMenuModelService.newCeMenu();
    aaUiModel.closedHours = AutoAttendantCeMenuModelService.newCeMenu();

    $scope.schedule = schedule;
    $scope.index = index;
    $scope.menuId = menuId;

    var menuOpen = AutoAttendantCeMenuModelService.newCeMenuEntry();
    var menuClosed = AutoAttendantCeMenuModelService.newCeMenuEntry();

    aaUiModel['openHours'].addEntryAt(index, menuOpen);
    aaUiModel['closedHours'].addEntryAt(index, menuClosed);
    var action = AutoAttendantCeMenuModelService.newCeActionEntry('runActionsOnInput', '');
    action.variableName = 'Closed Variable';
    menuClosed.addAction(action);

    controller = $controller('AACallerInputCtrl', {
      $scope: $scope,
    });


    $scope.$apply();
  }));

  afterEach(function () {
    $rootScope = null;
    $scope = null;
    featureToggleService = null;
    aaLanguageService = null;
    AAUiModelService = null;
    AutoAttendantCeMenuModelService = null;
    aaCommonService = null;
    controller = null;
    aaUiModel = null;
  });

  describe('add runActionsOnInput action', function () {
    it('should add runActionsOnInput action object menuEntry', function () {
      // appends a play action onto menuEntry
      expect(controller.menuEntry.actions[0].name).toEqual('runActionsOnInput');
    });
    it('should set warn to true because of duplicate variable name in session object', function () {
      controller.nameInput = 'account_no';
      controller.saveNameInput();
      expect(controller.isWarn).toEqual(true);
    });
    it('should set warn to true because of duplicate variable name in model', function () {
      controller.nameInput = 'Closed Variable';
      controller.saveNameInput();
      expect(controller.isWarn).toEqual(true);
    });
    it('should not set warn to true', function () {
      controller.nameInput = 'Unique name';
      controller.saveNameInput();
      expect(controller.isWarn).toEqual(false);
    });
    it('should invalid to true', function () {
      controller.nameInput = undefined;
      controller.saveNameInput();
      expect(controller.isWarn).toEqual(false);
      expect(aaCommonService.isValid()).toEqual(false);
    });
  });

  describe('setOldCallerInputValue', function () {
    it('should set old caller input value to a specified string', function () {
      controller.setOldCallerInputValue('testDummyData');
      expect(controller.oldCallerInputValue).toEqual('testDummyData');
    });
  });

  describe('updateCIAction', function () {
    it('should update Caller Input action', function () {
      controller.updateCIAction();
    });
  });

  describe('addKeyAction', function () {
    it('should add a new keyAction object into inputActions array', function () {
      var headkey = '0';
      var keys = [headkey, '1', '2', '3', '4', '5', '6', '7', '8', '9', '#', '*'];
      controller.inputActions = [];
      controller.addKeyAction();
      expect(controller.inputActions.length).toEqual(1);
      expect(controller.inputActions[0].keys.join()).toEqual(keys.join());
      expect(controller.inputActions[0].key).toEqual(headkey);
      expect(aaCommonService.isFormDirty()).toEqual(true);
    });
    it('should add a new keyAction object into inputActions array without the key already in use', function () {
      var keys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '#', '*'];
      var keysWithout3 = ['0', '1', '2', '4', '5', '6', '7', '8', '9', '#', '*'];
      // phone menu without a key row
      controller.inputActions = [];
      // add a new key row
      controller.addKeyAction();
      expect(controller.inputActions.length).toEqual(1);
      expect(controller.inputActions[0].keys.join()).toEqual(keys.join());
      // select key 3
      controller.inputActions[0].key = '3';
      // add another key row and check that key 3 is not available
      controller.addKeyAction();
      expect(controller.inputActions.length).toEqual(2);
      expect(controller.inputActions[1].keys.join()).toEqual(keysWithout3.join());
      expect(aaCommonService.isFormDirty()).toEqual(true);
    });
  });

  describe('deleteKeyAction', function () {
    it('should delete an existing keyAction object from the inputActions array', function () {
      // inputActions should hold three elements entering
      var keys = ['0', '1', '2', '4', '5', '6', '7', '8', '9', '#', '*'];

      controller.inputActions = _.cloneDeep(inputActions);
      controller.deleteKeyAction(0);
      expect(controller.inputActions.length).toEqual(2);
      expect(controller.inputActions[0].keys.join()).toEqual(keys.join());
      expect(aaCommonService.isFormDirty()).toEqual(true);
    });
  });

  describe('keyChanged', function () {
    it('should change the key for an existing action', function () {
      controller.inputActions = _.cloneDeep(inputActions);
      var newKey = '4';
      controller.keyChanged(0, newKey);
      expect(controller.inputActions[0].key).toEqual(newKey);
      expect(aaCommonService.isFormDirty()).toEqual(true);
    });
  });

  describe('keyInputChanged', function () {
    var whichKey = {};

    it('should change the input value for an existing action', function () {
      whichKey.value = 'X';
      controller.inputActions = _.cloneDeep(inputActions);
      controller.keyInputChanged(0, whichKey);
      expect(controller.inputActions[0].value).toEqual('X');
      expect(aaCommonService.isFormDirty()).toEqual(true);
    });

    it('should check the validity of input value', function () {
      whichKey.value = undefined;
      controller.inputActions = _.cloneDeep(inputActions);
      controller.keyInputChanged(0, whichKey);
      expect(controller.inputActions[0].value).toEqual(undefined);
      expect(aaCommonService.isValid()).toEqual(false);
      expect(controller.isWarn).toEqual(false);
    });
  });

  describe('setType', function () {
    it('should change the inputType to DIGITS_CHOICE', function () {
      controller.convertDigitState = true;
      controller.setType();
      expect(controller.actionEntry.inputType).toEqual(aaCommonService.DIGITS_CHOICE);
      expect(aaCommonService.isFormDirty()).toEqual(true);
    });
    it('should change the inputType to DIGITS_RAW', function () {
      controller.convertDigitState = false;
      controller.setType();
      expect(controller.actionEntry.inputType).toEqual(aaCommonService.DIGITS_RAW);
      expect(aaCommonService.isFormDirty()).toEqual(true);
    });
  });

  describe('set Name Variable', function () {
    it('should change the Name Variable', function () {
      controller.nameInput = 'Hello World';
      controller.saveNameInput();
      expect(controller.actionEntry.variableName).toEqual('Hello World');
      expect(aaCommonService.isFormDirty()).toEqual(true);
    });
  });

  describe('set Max String Length', function () {
    it('should change the Maximum String Length', function () {
      controller.maxStringLength = 30;

      controller.setMaxStringLength();

      expect(controller.actionEntry.maxNumberOfCharacters).toEqual(30);
      expect(aaCommonService.isFormDirty()).toEqual(true);
    });
  });

  describe('voiceOption', function () {
    it('should find the voice option', function () {
      var voiceOptions = [{
        label: 'label1',
        value: 'Miss Piggy',
      }, {
        label: 'label2',
        value: 'Kermit',
      }];

      var voiceOption = {
        label: 'label1',
        value: 'Miss Piggy',
      };

      spyOn(aaLanguageService, 'getVoiceOption').and.returnValue(voiceOption);
      spyOn(aaLanguageService, 'getVoiceOptions').and.returnValue(voiceOptions);

      controller.voiceBackup = undefined;
      controller.setVoiceOptions();
      expect(controller.voiceOption.value).toEqual(voiceOption.value);
    });
    it('should not find the voice option', function () {
      var voiceOptions = [{
        label: 'label1',
        value: 'Miss Piggy',
      }, {
        label: 'label2',
        value: 'Kermit',
      }];

      var voiceOption = {
        label: 'label',
        value: 'Miss Piggy',
      };

      spyOn(aaLanguageService, 'getVoiceOption').and.returnValue(voiceOption);
      spyOn(aaLanguageService, 'getVoiceOptions').and.returnValue(voiceOptions);

      controller.voiceBackup = undefined;
      controller.setVoiceOptions();
      expect(controller.voiceOption.value).toEqual(voiceOptions[0].value);
      expect(aaCommonService.isFormDirty()).toEqual(true);
    });
  });
});
