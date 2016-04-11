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
      var headkey = '0';
      var keys = [headkey, '1', '2', '3', '4', '5', '6', '7', '8', '9', '#', '*'];
      controller.selectedActions = [];
      controller.menuEntry = AutoAttendantCeMenuModelService.newCeMenu();
      controller.addKeyAction();
      expect(controller.selectedActions.length).toEqual(1);
      expect(controller.selectedActions[0].keys.join()).toEqual(keys.join());
      expect(controller.selectedActions[0].key).toEqual(headkey);

      expect(controller.menuEntry.entries.length).toEqual(1);
    });

    it('should add a new keyAction object into selectedActions array without the key already in use', function () {
      var keys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '#', '*'];
      var keysWithout3 = ['0', '1', '2', '4', '5', '6', '7', '8', '9', '#', '*'];
      controller.menuEntry = AutoAttendantCeMenuModelService.newCeMenu();
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
      controller.menuEntry = angular.copy(data.ceMenu);
      controller.deleteKeyAction(0);
      expect(controller.selectedActions.length).toEqual(1);
      expect(controller.selectedActions[0]).toEqual(data.oneSelectedAction);
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
    it('should write Repeat-this-Menu action to the model', function () {
      var ceMenu = angular.copy(data.ceMenu);
      var expectEntry = raw2MenuEntry(ceMenu.entries[0]);
      var phoneMenu = {
        "type": "MENU_OPTION",
        "entries": [],
        "headers": []
      };
      controller.menuEntry = phoneMenu;
      controller.selectedActions = [];
      controller.addKeyAction();
      controller.keyChanged(0, '1');

      controller.keyActionChanged(0, data.selectedActionsRepeatMenu[0].action);

      expect(angular.equals(expectEntry, controller.menuEntry.entries[0])).toEqual(true);
    });

    it('should change Repeat-Menu to Dial-by-Extension action in the model', function () {
      var ceMenu = angular.copy(data.ceMenu);
      var expectEntry = raw2MenuEntry(ceMenu.entries[0]);
      var expectEntry2 = raw2MenuEntry(ceMenu.entries[1]);
      var phoneMenu = {
        "type": "MENU_OPTION",
        "entries": [],
        "headers": []
      };
      controller.menuEntry = phoneMenu;
      controller.selectedActions = [];
      controller.addKeyAction();
      controller.keyChanged(0, '1');

      controller.keyActionChanged(0, data.selectedActionsRepeatMenu[0].action);
      expect(angular.equals(expectEntry, controller.menuEntry.entries[0])).toEqual(true);

      controller.keyChanged(0, '2');
      controller.keyActionChanged(0, data.selectedActionsDialExt[0].action);
      expect(angular.equals(expectEntry2, controller.menuEntry.entries[0])).toEqual(true);
    });

  });

  describe('createOptionMenu', function () {
    it('should intialize CeMenu first entry with first available key', function () {
      controller.createOptionMenu();

      var headkey = '0';
      expect(controller.entries[index].entries[0]).toBeDefined();
      expect(controller.entries[index].entries[0].key).toEqual(headkey);
    });

  });
  describe('populateUiMenu', function () {
    it('should read the CeMenu and populate the Option menu', function () {
      controller.menuEntry = angular.copy(data.ceMenu);
      controller.selectedActions = [];
      controller.populateOptionMenu();
      var expectedActions = [];
      expectedActions.push(data.selectedActionsRepeatMenu[0]);
      expectedActions.push(data.selectedActionsDialExt[0]);

      expect(angular.equals(expectedActions, controller.selectedActions)).toEqual(true);

    });

  });

  describe('populateUiMenu', function () {
    it('should read the CeMenu and populate the Option menu with blank values', function () {
      controller.menuEntry = angular.copy(data.ceMenu);
      controller.menuEntry.entries[0].actions[0].name = "";

      controller.selectedActions = [];

      controller.populateOptionMenu();

      expect(angular.equals(controller.selectedActions[0].action.name, "")).toEqual(true);

    });
  });

});
