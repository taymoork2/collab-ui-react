'use strict';

describe('Controller: AAPhoneMenuCtrl', function () {
  var controller;
  var FeatureToggleService;
  var AAUiModelService, AutoAttendantCeMenuModelService;
  var $rootScope, $scope, $q;
  var aaUiModel = {
    openHours: {}
  };
  var schedule = 'openHours';
  var index = '0';
  var menuId = 'menu1';
  var attempts = 4;

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

  function raw2Menu(raw) {
    var _menu = AutoAttendantCeMenuModelService.newCeMenu();
    angular.extend(_menu, raw);
    _menu.headers = [];
    _menu.entries = [];
    for (var i = 0; i < raw.headers.length; i++) {
      _menu.headers[i] = raw2MenuEntry(raw.headers[i]);
    }
    for (var j = 0; j < raw.entries.length; j++) {
      if (_.has(raw.entries[j], 'headers') && _.has(raw.entries[j], 'entries')) {
        _menu.entries[j] = raw2Menu(raw.entries[j]);
      } else {
        _menu.entries[j] = raw2MenuEntry(raw.entries[j]);
      }
    }
    return _menu;
  }

  var sortedOptions = [{
    "name": 'phoneMenuDialExt',
  }, {
    "name": 'phoneMenuPlaySubmenu',
  }, {
    "name": 'phoneMenuRepeatMenu',
  }, {
    "name": 'phoneMenuRouteAA',
  }, {
    "name": 'phoneMenuRouteHunt',
  }, {
    "name": 'phoneMenuRouteMailbox',
  }, {
    "name": 'phoneMenuRouteQueue',
  }, {
    "name": 'phoneMenuRouteToExtNum',
  }, {
    "name": 'phoneMenuRouteUser',
  }, {
    "name": 'phoneMenuSayMessage',
  }];

  beforeEach(angular.mock.module('uc.autoattendant'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));

  beforeEach(inject(function ($controller, _$rootScope_, _$q_, _FeatureToggleService_, _AAUiModelService_, _AutoAttendantCeMenuModelService_) {
    $rootScope = _$rootScope_;
    $scope = $rootScope;
    $q = _$q_;

    FeatureToggleService = _FeatureToggleService_;
    AAUiModelService = _AAUiModelService_;
    AutoAttendantCeMenuModelService = _AutoAttendantCeMenuModelService_;

    spyOn(AAUiModelService, 'getUiModel').and.returnValue(aaUiModel);
    spyOn(FeatureToggleService, 'supports').and.returnValue($q.when(true));

    AutoAttendantCeMenuModelService.clearCeMenuMap();
    aaUiModel.openHours = AutoAttendantCeMenuModelService.newCeMenu();
    $scope.schedule = schedule;
    $scope.index = index;
    $scope.menuId = menuId;

    var menu = AutoAttendantCeMenuModelService.newCeMenu();
    menu.type = 'MENU_OPTION';
    menu.attempts = attempts;
    aaUiModel['openHours'].addEntryAt(index, menu);

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

    it('Should remove the submenu from menu map when switching from Play Submenu action to other action', function () {
      var ceMenu = angular.copy(data.ceMenu);
      var expectEntry = raw2MenuEntry(ceMenu.entries[0]);
      var expectEntry2 = raw2Menu(ceMenu.entries[2]);
      var phoneMenu = {
        "type": "MENU_OPTION",
        "entries": [],
        "headers": [],
        "attempts": 4
      };
      controller.menuEntry = phoneMenu;
      controller.selectedActions = [];
      controller.addKeyAction();

      controller.keyChanged(0, '3');
      controller.keyActionChanged(0, data.selectedActionsPlaySubmenu[0].action);
      expect(angular.equals(expectEntry2, controller.menuEntry.entries[0])).toEqual(true);
      var newSubmenuId = controller.menuEntry.entries[0].id;
      expect(angular.isDefined(AutoAttendantCeMenuModelService.getCeMenu(newSubmenuId))).toBe(true);

      controller.keyChanged(0, '1');
      controller.keyActionChanged(0, data.selectedActionsRepeatMenu[0].action);
      expect(angular.equals(expectEntry, controller.menuEntry.entries[0])).toEqual(true);
      expect(angular.isDefined(AutoAttendantCeMenuModelService.getCeMenu(newSubmenuId))).toBe(false);
    });

    it('should change Repeat-Menu to Play Submenu action in the model and copy the attempts from main menu', function () {
      var ceMenu = angular.copy(data.ceMenu);
      var expectEntry = raw2MenuEntry(ceMenu.entries[0]);
      var expectEntry2 = raw2Menu(ceMenu.entries[2]);
      var phoneMenu = {
        "type": "MENU_OPTION",
        "entries": [],
        "headers": [],
        "attempts": attempts
      };
      controller.menuEntry = phoneMenu;
      controller.selectedActions = [];
      controller.addKeyAction();
      controller.keyChanged(0, '1');

      controller.keyActionChanged(0, data.selectedActionsRepeatMenu[0].action);
      expect(angular.equals(expectEntry, controller.menuEntry.entries[0])).toEqual(true);

      controller.keyChanged(0, '3');
      controller.keyActionChanged(0, data.selectedActionsPlaySubmenu[0].action);
      expect(angular.equals(expectEntry2, controller.menuEntry.entries[0])).toEqual(true);

      expect(controller.menuEntry.attempts).toEqual(attempts);
    });

    it('should successfully change a Say-Message button to a Route-To-User button', function () {
      var ceMenuWithSay = angular.copy(data.ceMenuWithSay);
      var ceMenuWithRouteToUser = angular.copy(data.ceMenuWithRouteToUser);
      var phoneMenuEntry = raw2MenuEntry(ceMenuWithSay.entries[0]);
      var expectEntry = raw2MenuEntry(ceMenuWithRouteToUser.entries[0]);
      var phoneMenu = {
        "type": "MENU_OPTION",
        "entries": [],
        "headers": []
      };
      phoneMenu.entries.push(phoneMenuEntry);
      controller.menuEntry = phoneMenu;

      controller.keyActionChanged(0, data.selectedActionsRouteUser[0].action);
      expect(angular.equals(expectEntry, controller.menuEntry.entries[0])).toEqual(true);
    });

  });

  describe('addButtonZero', function () {
    it('should intialize CeMenu first entry with first available key', function () {
      controller.menuEntry = AutoAttendantCeMenuModelService.newCeMenu();
      controller.selectedActions = [];

      controller.addButtonZero();

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
      expectedActions.push(data.selectedActionsPlaySubmenu[0]);

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

  /**
   * name value is not read from properties file in unit test cases. It will treat the key provided into vm.keyActions for name
   * as text only. Sorting is based on the key itself and not on values of title.
   */
  describe('activate', function () {
    it('should define and export menuId to its child directives', function () {
      expect(controller.menuId).toEqual('menu1');
    });

    it('test for sorted options', function () {
      for (var i = 0; i < sortedOptions.length; i++) {
        expect(controller.keyActions[i].name).toEqual(sortedOptions[i].name);
      }
    });
  });

});
