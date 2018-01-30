'use strict';

describe('Controller: AASubmenuCtrl', function () {
  var controller;
  var AutoAttendantCeMenuModelService, AutoAttendantHybridCareService, AACommonService;
  var $rootScope, $scope, $controller;
  var aaUiModel = {
    openHours: {},
  };
  var schedule = 'openHours';
  var index = '0';
  var keyIndex = '1';
  var menuId = 'menu1';
  var queueName = 'Sunlight Queue 1';
  var queues = [{
    queueName: queueName,
    queueUrl: '/c16a6027-caef-4429-b3af-9d61ddc7964b',
  }];

  var data = getJSONFixture('huron/json/autoAttendant/aaPhoneMenuCtrl.json');
  var submenuData = getJSONFixture('huron/json/autoAttendant/combinedMenu.json');

  function raw2MenuEntry(raw) {
    var _menuEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
    _.assign(_menuEntry, raw);
    _menuEntry.actions = [];
    for (var j = 0; j < raw.actions.length; j++) {
      var _action = AutoAttendantCeMenuModelService.newCeActionEntry();
      _.assign(_action, raw.actions[j]);
      _menuEntry.addAction(_action);
    }
    return _menuEntry;
  }

  function raw2Menu(raw) {
    var _menu = AutoAttendantCeMenuModelService.newCeMenu();
    _.assign(_menu, raw);
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
    label: 'autoAttendant.actionSayMessage',
  }, {
    label: 'autoAttendant.phoneMenuDialExt',
  }, {
    label: 'autoAttendant.phoneMenuGoBack',
  }, {
    label: 'autoAttendant.phoneMenuRepeatMenu',
  }, {
    label: 'autoAttendant.phoneMenuRouteAA',
  }, {
    label: 'autoAttendant.phoneMenuRouteHunt',
  }, {
    label: 'autoAttendant.phoneMenuRouteQueue',
  }, {
    label: 'autoAttendant.phoneMenuRouteToExtNum',
  }, {
    label: 'autoAttendant.phoneMenuRouteToSipEndpoint',
  }, {
    label: 'autoAttendant.phoneMenuRouteUser',
  }, {
    label: 'autoAttendant.phoneMenuRouteVM',
  }];

  beforeEach(angular.mock.module('uc.autoattendant'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));

  beforeEach(inject(function (_$controller_, _$rootScope_, _AutoAttendantCeMenuModelService_, _AutoAttendantHybridCareService_, _AACommonService_) {
    $rootScope = _$rootScope_;
    $scope = $rootScope;
    $controller = _$controller_;

    AutoAttendantCeMenuModelService = _AutoAttendantCeMenuModelService_;
    AACommonService = _AACommonService_;

    AutoAttendantHybridCareService = _AutoAttendantHybridCareService_;
    AutoAttendantCeMenuModelService.clearCeMenuMap();
    aaUiModel.openHours = raw2Menu(submenuData.combinedMenuWithSubmenu2);
    $scope.schedule = schedule;
    $scope.index = index;
    $scope.keyIndex = keyIndex;
    $scope.menuId = menuId;
    $scope.queues = JSON.stringify(queues);

    spyOn(AACommonService, 'isRouteSIPAddressToggle').and.returnValue(true);

    controller = $controller('AASubmenuCtrl', {
      $scope: $scope,
    });
    $scope.$apply();
  }));

  afterEach(function () {
    AutoAttendantCeMenuModelService = AACommonService = AutoAttendantHybridCareService = null;
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
      controller.selectedActions = _.cloneDeep(data.selectedActions);
      controller.menuEntry = _.cloneDeep(data.ceMenu);
      controller.deleteKeyAction(0);
      expect(controller.selectedActions.length).toEqual(1);
      expect(controller.selectedActions[0]).toEqual(data.oneSelectedAction);
    });
  });

  describe('keyChanged', function () {
    it('should change the key for an existing action', function () {
      controller.menuEntry = _.cloneDeep(data.ceMenu);
      controller.selectedActions = _.cloneDeep(data.selectedActions);
      var newKey = '3';
      controller.keyChanged(0, newKey);
      expect(controller.selectedActions[0].key).toEqual(newKey);
    });
  });

  describe('keyActionChanged', function () {
    it('should write Repeat-this-Menu action to the model', function () {
      var ceMenu = _.cloneDeep(data.ceMenu);
      var expectEntry = raw2MenuEntry(ceMenu.entries[0]);
      var phoneMenu = {
        type: 'MENU_OPTION',
        entries: [],
        headers: [],
      };
      controller.menuEntry = phoneMenu;
      controller.selectedActions = [];
      controller.addKeyAction();
      controller.keyChanged(0, '1');

      controller.keyActionChanged(0, data.selectedActionsRepeatMenu[0].action);

      expect(angular.equals(expectEntry, controller.menuEntry.entries[0])).toEqual(true);
    });

    it('should change Repeat-Menu to Dial-by-Extension action in the model', function () {
      var ceMenuDialByExtension = _.cloneDeep(data.ceMenuDialByExtension);
      var expectEntry = raw2MenuEntry(ceMenuDialByExtension.entries[0]);
      var expectEntry2 = raw2MenuEntry(ceMenuDialByExtension.entries[1]);
      var phoneMenu = {
        type: 'MENU_OPTION',
        entries: [],
        headers: [],
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
      var ceMenu = _.cloneDeep(data.ceMenu);
      var expectEntry = raw2MenuEntry(ceMenu.entries[0]);
      var expectEntry2 = raw2MenuEntry(ceMenu.entries[0]);
      expectEntry2.actions[0].level = -1;
      expectEntry2.key = '3';
      var phoneMenu = {
        type: 'MENU_OPTION',
        entries: [],
        headers: [],
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
      var ceMenuWithSay = _.cloneDeep(data.ceMenuWithSay);
      var ceMenuWithRouteToUser = _.cloneDeep(data.ceMenuWithRouteToUser);
      var phoneMenuEntry = raw2MenuEntry(ceMenuWithSay.entries[0]);
      var expectEntry = raw2MenuEntry(ceMenuWithRouteToUser.entries[0]);
      var phoneMenu = {
        type: 'MENU_OPTION',
        entries: [],
        headers: [],
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
      data.selectedActionsGoBack[0].key = '*';
      data.selectedActionsGoBack[0].keys = ['3', '4', '5', '6', '7', '8', '9', '#', '*'];
      expectedActions.push(data.selectedActionsGoBack[0]);

      data.selectedActionsRepeatMenu[0].key = '0';
      data.selectedActionsRepeatMenu[0].keys = ['0', '3', '4', '5', '6', '7', '8', '9', '#'];
      expectedActions.push(data.selectedActionsRepeatMenu[0]);

      data.selectedActionsRouteUser[0].key = '1';
      data.selectedActionsRouteUser[0].keys = ['1', '3', '4', '5', '6', '7', '8', '9', '#'];
      expectedActions.push(data.selectedActionsRouteUser[0]);

      data.selectedActionsDialExt[0].key = '2';
      data.selectedActionsDialExt[0].keys = ['2', '3', '4', '5', '6', '7', '8', '9', '#'];
      expectedActions.push(data.selectedActionsDialExt[0]);

      expect(angular.equals(expectedActions, controller.selectedActions)).toEqual(true);
    });
    it('should sort options', function () {
      for (var i = 0; i < sortedOptions.length; i++) {
        expect(controller.keyActions[i].label).toEqual(sortedOptions[i].label);
      }
    });
  });

  describe('Check spark call options', function () {
    it('should add the sparkCalloptions when hybrid toggle is enabled and sparkCall is also configured', function () {
      spyOn(AutoAttendantHybridCareService, 'isSparkCallConfigured').and.returnValue(true);
      spyOn(AACommonService, 'isHybridEnabledOnOrg').and.returnValue(true);
      $scope.$apply();
      expect(controller.keyActions.length).toBe(sortedOptions.length);
      var keyActions = controller.keyActions;
      _.forEach(keyActions, sortedOptions, function (actual, expected) {
        expect(actual.label).toBe(expected.label);
      });
    });
    it('should not add the sparkCalloptions when hybrid toggle is enabled and sparkCall is not configured', function () {
      spyOn(AutoAttendantHybridCareService, 'isSparkCallConfigured').and.returnValue(false);
      spyOn(AACommonService, 'isHybridEnabledOnOrg').and.returnValue(true);
      $scope.$apply();

      var options = _.difference(sortedOptions, [{
        label: 'autoAttendant.phoneMenuDialExt',
      }, {
        label: 'autoAttendant.phoneMenuRouteHunt',
      }, {
        label: 'autoAttendant.phoneMenuRouteVM',
      }]);
      expect(controller.keyActions.length).toBe(options.length);
      var keyActions = controller.keyActions;
      _.forEach(keyActions, options, function (actual, expected) {
        expect(actual.label).toBe(expected.label);
      });
    });
  });
});
