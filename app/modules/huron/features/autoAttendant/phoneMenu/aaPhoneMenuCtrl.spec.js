'use strict';

describe('Controller: AAPhoneMenuCtrl', function () {
  var controller;
  var AAUiModelService, AutoAttendantCeService, AutoAttendantCeInfoModelService, AutoAttendantCeMenuModelService;
  var $rootScope, $scope, $translate;
  var aaUiModel = {
    openHours: {}
  };
  var schedule = 'openHours';
  var index = '0';

  var data = getJSONFixture('huron/json/autoAttendant/aaPhoneMenuCtrl.json');

  function raw2MenuEntry(raw) {
    var _menuEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
    angular.extend(_menuEntry, raw);
    _menuEntry.actions = [];
    for (var j = 0; j < raw.actions.length; j++) {
      var _action = AutoAttendantCeMenuModelService.newCeActionEntry();
      angular.extend(_action, raw.actions[j]);
      _menuEntry.addAction(_action);
    }
    return _menuEntry;
  }

  beforeEach(module('uc.autoattendant'));
  beforeEach(module('Huron'));

  beforeEach(inject(function ($controller, _$translate_, _$rootScope_, _AAUiModelService_, _AutoAttendantCeService_, _AutoAttendantCeInfoModelService_, _AutoAttendantCeMenuModelService_) {
    $rootScope = _$rootScope_;
    $scope = $rootScope;
    $translate = _$translate_;

    AAUiModelService = _AAUiModelService_;
    AutoAttendantCeService = _AutoAttendantCeService_;
    AutoAttendantCeInfoModelService = _AutoAttendantCeInfoModelService_;
    AutoAttendantCeMenuModelService = _AutoAttendantCeMenuModelService_;

    spyOn(AAUiModelService, 'getUiModel').and.returnValue(aaUiModel);

    aaUiModel.openHours = AutoAttendantCeMenuModelService.newCeMenu();
    $scope.schedule = schedule;
    $scope.index = index;
    aaUiModel['openHours'].addEntryAt(index, AutoAttendantCeMenuModelService.newCeMenuEntry());

    controller = $controller('AAPhoneMenuCtrl', {
      $scope: $scope
    });
    $scope.$apply();

  }));

  afterEach(function () {

  });

  describe('addKeyAction', function () {
    it('should add a new keyAction object into selectedActions array', function () {
      var keys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '#', '*'];
      controller.selectedActions = [];
      controller.addKeyAction();
      expect(controller.selectedActions.length).toEqual(1);
      expect(controller.selectedActions[0].keys.join()).toEqual(keys.join());
    });

    it('should add a new keyAction object into selectedActions array without the key already in use', function () {
      var keys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '#', '*'];
      var keysWithout3 = ['0', '1', '2', '4', '5', '6', '7', '8', '9', '#', '*'];
      // phone menu without a key row
      controller.selectedActions = [];
      // add a new key row
      controller.addKeyAction();
      expect(controller.selectedActions.length).toEqual(1);
      expect(controller.selectedActions[0].keys.join()).toEqual(keys.join());
      // select key 3
      controller.selectedActions[0].key = '3';
      // add another key row and check that key 3 is not available
      controller.addKeyAction();
      expect(controller.selectedActions.length).toEqual(2);
      expect(controller.selectedActions[1].keys.join()).toEqual(keysWithout3.join());
    });
  });

  describe('deleteKeyAction', function () {
    it('should delete an existing keyAction object from the selectedActions array', function () {
      controller.selectedActions = angular.copy(data.selectedActions);
      controller.deleteKeyAction(0);
      expect(controller.selectedActions.length).toEqual(1);
      expect(controller.selectedActions[0]).toEqual(data.selectedActions[1]);
    });
  });

  describe('timeoutActionChanged ', function () {
    it('should change the attempts attribute', function () {
      controller.menuEntry = angular.copy(data.ceMenu);
      controller.selectedTimeout = data.selectedTimeout;
      controller.timeoutActionChanged();
      expect(controller.menuEntry.attempts).toEqual(controller.selectedTimeout.value);
    });
  });

  describe('keyChanged', function () {
    it('should change the key for an existing action', function () {
      controller.menuEntry = angular.copy(data.ceMenu);
      controller.selectedActions = angular.copy(data.selectedActions);
      var newKey = '3';
      controller.keyChanged(0, newKey);
      expect(controller.selectedActions[0].key).toEqual(newKey);
    });
  });

  describe('keyActionChanged', function () {
    it('should change the action for an existing key', function () {
      controller.menuEntry = angular.copy(data.ceMenu);
      controller.selectedActions = angular.copy(data.selectedActions);
      var newAction = data.selectedActionsHuntGroup;
      controller.keyActionChanged(0, newAction);
      expect(controller.selectedActions[0].value).toEqual(newAction);
    });
  });

  describe('populateOptionMenu', function () {

    it('should read the CeMenu and populate the Option menu', function () {
      controller.menuEntry = angular.copy(data.ceMenu);
      controller.selectedActions = [];
      controller.populateOptionMenu();
      var expectedActions = [];
      expectedActions.push(data.selectedActionsRepeatMenu[0]);
      expectedActions.push(data.selectedActionsDialExt[0]);
      expect(angular.equals(expectedActions, controller.selectedActions)).toEqual(true);
      var expectedSayMessage = controller.menuEntry.headers[0].actions[0].value;
      expect(angular.equals(expectedSayMessage, controller.sayMessage)).toEqual(true);
    });
  });

  describe('saveUiModel', function () {

    it('should write Repeat-this-Menu action to the model', function () {
      var ceMenu = angular.copy(data.ceMenu);
      // phone menu at entry 0
      controller.uiMenu = {};
      controller.uiMenu.entries = [{
        "type": "MENU_OPTION",
        "entries": [],
        "headers": []
      }];
      $scope.index = 0;
      controller.menuEntry = controller.uiMenu.entries[$scope.index];
      controller.selectedActions = data.selectedActionsRepeatMenu;
      controller.saveUIModel();
      var expectEntry = raw2MenuEntry(ceMenu.entries[0]);
      expect(angular.equals(expectEntry, controller.uiMenu.entries[0].entries[0])).toEqual(true);
    });

    it('should write Dial-by-Extension action to the model', function () {
      var ceMenu = angular.copy(data.ceMenu);
      // phone menu at entry 0
      controller.uiMenu = {};
      controller.uiMenu.entries = [{
        "type": "MENU_OPTION",
        "entries": [],
        "headers": []
      }];
      $scope.index = 0;
      controller.menuEntry = controller.uiMenu.entries[$scope.index];
      controller.selectedActions = data.selectedActionsDialExt;
      controller.saveUIModel();
      var expectEntry = raw2MenuEntry(ceMenu.entries[1]);
      expect(angular.equals(expectEntry, controller.uiMenu.entries[0].entries[0])).toEqual(true);
    });

  });

  // describe('setVoiceOptions', function () {
  //   it('should have voice options for selected language', function () {
  //     controller.languageOption.value = "it_IT";
  //     controller.setVoiceOptions();
  //     $scope.$apply();

  //     expect(controller.voiceOptions.length).toEqual(8);

  //   });

  //   it('should select previously saved voiceOption if available', function () {
  //     var voice = "Kate";
  //     controller.voiceBackup.value = voice;
  //     controller.languageOption.value = "en_GB";
  //     controller.setVoiceOptions();
  //     $scope.$apply();

  //     expect(controller.voiceOption.value).toEqual(voice);
  //   });

  // });

});
