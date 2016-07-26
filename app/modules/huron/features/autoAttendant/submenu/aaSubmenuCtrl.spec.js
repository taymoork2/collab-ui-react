'use strict';

describe('Controller: AASubmenuCtrl', function () {
  var controller;
  var AutoAttendantCeMenuModelService, FeatureToggleService;
  var $rootScope, $scope, $translate, $q;
  var aaUiModel = {
    openHours: {}
  };
  var schedule = 'openHours';
  var index = '0';
  var keyIndex = '1';
  var menuId = 'menu1';

  var data = getJSONFixture('huron/json/autoAttendant/aaPhoneMenuCtrl.json');
  var submenuData = getJSONFixture('huron/json/autoAttendant/combinedMenu.json');

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
    "name": 'phoneMenuGoBack',
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

  beforeEach(module('uc.autoattendant'));
  beforeEach(module('Huron'));
  beforeEach(module('Sunlight'));

  beforeEach(inject(function ($controller, _$translate_, _$rootScope_, _$q_, _AutoAttendantCeMenuModelService_, _FeatureToggleService_) {
    $rootScope = _$rootScope_;
    $scope = $rootScope;
    $translate = _$translate_;
    $q = _$q_;

    AutoAttendantCeMenuModelService = _AutoAttendantCeMenuModelService_;
    FeatureToggleService = _FeatureToggleService_;

    AutoAttendantCeMenuModelService.clearCeMenuMap();
    aaUiModel.openHours = raw2Menu(submenuData.combinedMenuWithSubmenu2);
    $scope.schedule = schedule;
    $scope.index = index;
    $scope.keyIndex = keyIndex;
    $scope.menuId = menuId;

    spyOn(FeatureToggleService, 'supports').and.returnValue($q.when(true));

    controller = $controller('AASubmenuCtrl', {
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

    it('should change Repeat-Menu to Go Back action in the model', function () {
      var ceMenu = angular.copy(data.ceMenu);
      var expectEntry = raw2MenuEntry(ceMenu.entries[0]);
      var expectEntry2 = raw2MenuEntry(ceMenu.entries[0]);
      expectEntry2.actions[0].level = -1;
      expectEntry2.key = "3";
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

      controller.keyChanged(0, '3');
      controller.keyActionChanged(0, data.selectedActionsGoBack[0].action);
      expect(angular.equals(expectEntry2, controller.menuEntry.entries[0])).toEqual(true);
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
      expect(controller.menuEntry.entries[0]).toBeDefined();
      expect(controller.menuEntry.entries[0].key).toEqual(headkey);
    });
  });

  describe('activate', function () {
    it('should define and export menuId to its child directives', function () {
      expect(controller.menuId).toEqual('menu2');
    });

    it('should read and populate submenu', function () {
      var expectedActions = [];
      data.selectedActionsGoBack[0].key = "*";
      data.selectedActionsGoBack[0].keys = ['3', '4', '5', '6', '7', '8', '9', '#', '*'];
      expectedActions.push(data.selectedActionsGoBack[0]);

      data.selectedActionsRepeatMenu[0].key = "0";
      data.selectedActionsRepeatMenu[0].keys = ['0', '3', '4', '5', '6', '7', '8', '9', '#'];
      expectedActions.push(data.selectedActionsRepeatMenu[0]);

      data.selectedActionsRouteUser[0].key = "1";
      data.selectedActionsRouteUser[0].keys = ['1', '3', '4', '5', '6', '7', '8', '9', '#'];
      expectedActions.push(data.selectedActionsRouteUser[0]);

      data.selectedActionsDialExt[0].key = "2";
      data.selectedActionsDialExt[0].keys = ['2', '3', '4', '5', '6', '7', '8', '9', '#'];
      expectedActions.push(data.selectedActionsDialExt[0]);

      expect(angular.equals(expectedActions, controller.selectedActions)).toEqual(true);
    });

    it('should sort options', function () {
      for (var i = 0; i < sortedOptions.length; i++) {
        expect(controller.keyActions[i].name).toEqual(sortedOptions[i].name);
      }
    });
  });
});
