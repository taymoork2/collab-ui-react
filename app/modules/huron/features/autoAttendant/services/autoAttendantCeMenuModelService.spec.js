'use strict';

describe('Service: AutoAttendantCeMenuModelService', function () {
  var AutoAttendantCeMenuModelService;
  // require('jasmine-collection-matchers');

  var ceInfos = getJSONFixture('huron/json/autoAttendant/rawCeInfos.json');

  // Welcome menu
  var wmenu = getJSONFixture('huron/json/autoAttendant/welcomeMenu.json');
  var ceWelcome = wmenu.ceWelcome;
  var ceWelcomeNoDescription = wmenu.ceWelcomeNoDescription;
  var welcomeMenu = wmenu.welcomeMenu;
  var ceWelcome2 = {
    "callExperienceName": "AA Welcome",
    "assignedResources": [{
      "trigger": "incomingCall",
      "type": "directoryNumber",
      "id": "e7d68d8c-9e92-4330-a881-5fc9ace1f7d3"
    }],
    "defaultActionSet": "openHours",
    "scheduleEventTypeMap": {
      "open": "openHours"
    },
    "actionSets": [{
      "name": "openHours",
      "actions": [{
        "play": {
          "description": "Welcome prompt",
          "url": "file1.avi"
        }
      }]
    }]
  };

  // Combined menu
  var combmenu = getJSONFixture('huron/json/autoAttendant/combinedMenu.json');
  var ceCombined = combmenu.ceCombined;
  var combinedMenu = combmenu.combinedMenu;

  // Option menu
  var omenu = getJSONFixture('huron/json/autoAttendant/optionMenu.json');
  var ceOption = omenu.ceOption;
  var ceOptionUnsorted = omenu.ceOptionUnsorted;
  var optionMenu = omenu.optionMenu;

  // Custom menu
  var cmenu = getJSONFixture('huron/json/autoAttendant/customMenu.json');
  var ceCustom = cmenu.ceCustom;
  var customMenu = cmenu.customMenu;

  beforeEach(module('uc.autoattendant'));
  beforeEach(module('Huron'));

  beforeEach(inject(function (_AutoAttendantCeMenuModelService_) {
    AutoAttendantCeMenuModelService = _AutoAttendantCeMenuModelService_;

  }));

  afterEach(function () {

  });

  describe('getWelcomeMenu', function () {
    it('should return welcomeMenu from parsing ceWelcome', function () {
      var _welcomeMenu = AutoAttendantCeMenuModelService.getWelcomeMenu(ceWelcome, 'openHours');

      expect(angular.equals(_welcomeMenu, welcomeMenu)).toBe(true);
    });
  });

  describe('getOptionMenu', function () {
    it('should return optionMenu from parsing ceOption', function () {
      var _optionMenu = AutoAttendantCeMenuModelService.getOptionMenu(ceOption, 'openHours');
      expect(angular.equals(_optionMenu, optionMenu)).toBe(true);
    });
  });

  describe('getCustomMenu', function () {
    it('should return customMenu from parsing ceCustom', function () {
      var _customMenu = AutoAttendantCeMenuModelService.getCustomMenu(ceCustom, 'openHours');
      expect(angular.equals(_customMenu, customMenu)).toBe(true);
    });
  });

  describe('updateCombinedMenu', function () {
    it('should be able to update a ceRecord with combinedMenu', function () {
      var _ceRecord = angular.copy(ceInfos[0]);
      _ceRecord.callExperienceName = 'AA Combined';
      var _combinedMenu = AutoAttendantCeMenuModelService.getCombinedMenu(ceCombined, 'openHours');
      AutoAttendantCeMenuModelService.updateCombinedMenu(_ceRecord, 'openHours', _combinedMenu);
      expect(angular.equals(_ceRecord, ceCombined)).toBe(true);
    });
  });

  describe('updateMenu', function () {
    it('should be able to update an ceRecord with welcomeMenu (no description in goto case)', function () {
      var _ceRecord = angular.copy(ceInfos[0]);

      _ceRecord.defaultActionSet = "openHours";
      _ceRecord.scheduleEventTypeMap = {
        open: "openHours"
      };
      _ceRecord.callExperienceName = 'AA Welcome';
      var _welcomeMenu = AutoAttendantCeMenuModelService.getWelcomeMenu(ceWelcomeNoDescription, 'openHours');
      var success = AutoAttendantCeMenuModelService.updateMenu(_ceRecord, 'openHours', _welcomeMenu);

      expect(angular.equals(_ceRecord, ceWelcomeNoDescription)).toBe(true);

      expect(success).toBe(true);

    });
  });

  describe('updateMenu', function () {
    it('should be able to update an ceRecord with customMenu', function () {
      var _ceRecord = angular.copy(ceInfos[0]);
      _ceRecord.defaultActionSet = "openHours";
      _ceRecord.scheduleEventTypeMap = {
        open: "openHours"
      };
      _ceRecord.callExperienceName = 'AA Custom';
      var _welcomeMenu = AutoAttendantCeMenuModelService.getWelcomeMenu(ceWelcome, 'openHours');

      // if this splice to removes actions after play .. should be length -1
      _welcomeMenu.entries.splice(1, _welcomeMenu.entries.length - 1);

      var welcomeMenuSuccess = AutoAttendantCeMenuModelService.updateMenu(_ceRecord, 'openHours', _welcomeMenu);
      var _customMenu = AutoAttendantCeMenuModelService.getCustomMenu(ceCustom, 'openHours');
      var customMenuSuccess = AutoAttendantCeMenuModelService.updateMenu(_ceRecord, 'openHours', _customMenu);

      expect(welcomeMenuSuccess).toBe(true);

      expect(customMenuSuccess).toBe(true);

      expect(angular.equals(_ceRecord, ceCustom)).toBe(true);

    });
  });

  describe('updateMenu', function () {
    it('should be able to update an ceRecord with optionMenu', function () {
      var _ceRecord = angular.copy(ceInfos[0]);
      _ceRecord.defaultActionSet = "openHours";
      _ceRecord.scheduleEventTypeMap = {
        open: "openHours"
      };
      _ceRecord.callExperienceName = 'AA Option';
      var _welcomeMenu = AutoAttendantCeMenuModelService.getWelcomeMenu(ceWelcome, 'openHours');

      // if this splice to removes actions after play .. should be length -1
      _welcomeMenu.entries.splice(1, _welcomeMenu.entries.length - 1);
      var welcomeMenuSuccess = AutoAttendantCeMenuModelService.updateMenu(_ceRecord, 'openHours', _welcomeMenu);
      var _optionMenu = AutoAttendantCeMenuModelService.getOptionMenu(ceOption, 'openHours');
      var optionMenuSuccess = AutoAttendantCeMenuModelService.updateMenu(_ceRecord, 'openHours', _optionMenu);
      expect(welcomeMenuSuccess).toBe(true);
      expect(optionMenuSuccess).toBe(true);
      expect(angular.equals(_ceRecord, ceOption)).toBe(true);
    });
  });

  describe('updateMenu', function () {
    it('should be able to update a ceRecord with sorted keys in optionMenu', function () {
      var _ceRecord = angular.copy(ceInfos[0]);
      _ceRecord.defaultActionSet = "openHours";
      _ceRecord.scheduleEventTypeMap = {
        open: "openHours"
      };
      _ceRecord.callExperienceName = 'AA Option';
      var _welcomeMenu = AutoAttendantCeMenuModelService.getWelcomeMenu(ceWelcome, 'openHours');

      // if this splice to removes actions after play .. should be length -1
      _welcomeMenu.entries.splice(1, _welcomeMenu.entries.length - 1);
      var welcomeMenuSuccess = AutoAttendantCeMenuModelService.updateMenu(_ceRecord, 'openHours', _welcomeMenu);
      var _optionMenu = AutoAttendantCeMenuModelService.getOptionMenu(ceOptionUnsorted, 'openHours');
      var optionMenuSuccess = AutoAttendantCeMenuModelService.updateMenu(_ceRecord, 'openHours', _optionMenu);
      expect(welcomeMenuSuccess).toBe(true);
      expect(optionMenuSuccess).toBe(true);
      expect(angular.equals(_ceRecord, ceOption)).toBe(true);
    });
  });

  describe('deleteMenu', function () {
    it('should be able to delete custom menu from a given ceRecord', function () {
      ceWelcome2.callExperienceName = 'AA Custom';
      var _ceRecord = angular.copy(ceCustom);
      var deleteSuccess = AutoAttendantCeMenuModelService.deleteMenu(_ceRecord, 'openHours', 'MENU_CUSTOM');
      expect(deleteSuccess).toBe(true);
      expect(angular.equals(_ceRecord, ceWelcome2)).toBe(true);
    });
  });

  describe('deleteMenu', function () {
    it('should be able to delete option menu from a given ceRecord', function () {
      ceWelcome2.callExperienceName = 'AA Option';
      var _ceRecord = angular.copy(ceOption);
      var deleteSuccess = AutoAttendantCeMenuModelService.deleteMenu(_ceRecord, 'openHours', 'MENU_OPTION');
      expect(deleteSuccess).toBe(true);
      expect(angular.equals(_ceRecord, ceWelcome2)).toBe(true);
    });
  });

  describe('deleteMenu', function () {
    it('should not succeed if 1st param is null', function () {
      ceWelcome2.callExperienceName = 'AA Option';
      var _ceRecord = angular.copy(ceOption);
      var deleteSuccess = AutoAttendantCeMenuModelService.deleteMenu(null, 'openHours', 'MENU_OPTION');
      expect(deleteSuccess).toBe(false);
      expect(angular.equals(_ceRecord, ceWelcome2)).toBe(false);
    });
  });

  describe('deleteMenu', function () {
    it('should not succeed if 1st param is undefined', function () {
      ceWelcome2.callExperienceName = 'AA Option';
      var _ceRecord = angular.copy(ceOption);
      var deleteSuccess = AutoAttendantCeMenuModelService.deleteMenu(undefined, 'openHours', 'MENU_OPTION');
      expect(deleteSuccess).toBe(false);
      expect(angular.equals(_ceRecord, ceWelcome2)).toBe(false);
    });
  });

  describe('deleteMenu', function () {
    it('should not succeed if 2nd param is null', function () {
      ceWelcome2.callExperienceName = 'AA Option';
      var _ceRecord = angular.copy(ceOption);
      var deleteSuccess = AutoAttendantCeMenuModelService.deleteMenu(_ceRecord, null, 'MENU_OPTION');
      expect(deleteSuccess).toBe(false);
      expect(angular.equals(_ceRecord, ceWelcome2)).toBe(false);
    });
  });

  describe('deleteMenu', function () {
    it('should not succeed if 2nd param is undefined', function () {
      ceWelcome2.callExperienceName = 'AA Option';
      var _ceRecord = angular.copy(ceOption);
      var deleteSuccess = AutoAttendantCeMenuModelService.deleteMenu(_ceRecord, undefined, 'MENU_OPTION');
      expect(deleteSuccess).toBe(false);
      expect(angular.equals(_ceRecord, ceWelcome2)).toBe(false);
    });
  });

  describe('deleteMenu', function () {
    it('should not succeed if 3rd param is null', function () {
      ceWelcome2.callExperienceName = 'AA Option';
      var _ceRecord = angular.copy(ceOption);
      var deleteSuccess = AutoAttendantCeMenuModelService.deleteMenu(_ceRecord, 'openHours', null);
      expect(deleteSuccess).toBe(false);
      expect(angular.equals(_ceRecord, ceWelcome2)).toBe(false);
    });
  });

  describe('deleteMenu', function () {
    it('should not succeed if 3rd param is undefined', function () {
      ceWelcome2.callExperienceName = 'AA Option';
      var _ceRecord = angular.copy(ceOption);
      var deleteSuccess = AutoAttendantCeMenuModelService.deleteMenu(_ceRecord, 'openHours', undefined);
      expect(deleteSuccess).toBe(false);
      expect(angular.equals(_ceRecord, ceWelcome2)).toBe(false);
    });
  });

  describe('deleteCombinedMenu', function () {
    it('should delete associated actionSet in a given ceRecord', function () {
      ceWelcome2.callExperienceName = 'AA Option';
      var _ceRecord = angular.copy(ceOption);
      var deleteSuccess = AutoAttendantCeMenuModelService.deleteCombinedMenu(_ceRecord, 'openHours');
      expect(deleteSuccess).toBe(true);
      expect(_ceRecord.actionSets.length).toEqual(0);
    });
  });

  describe('newCeActionEntry', function () {
    it('should have get and set methods defined for each attribute and be cloned successfully', function () {

      // check setter and getter
      var _action = AutoAttendantCeMenuModelService.newCeActionEntry('name', 'value');
      _action.setDescription('description');
      expect(_action.getDescription()).toBe('description');
      expect(_action.getName()).toBe('name');
      expect(_action.getValue()).toBe('value');

      _action.setDescription('description2');
      _action.setName('name2');
      _action.setValue('value2');
      expect(_action.getDescription()).toBe('description2');
      expect(_action.getName()).toBe('name2');
      expect(_action.getValue()).toBe('value2');

      // check clone
      var _action2 = _action.clone();
      expect(angular.equals(_action, _action2)).toBe(true);

      // check clone
      _action2.setDescription('description3');
      expect(angular.equals(_action, _action2)).toBe(false);
    });
  });

  describe('newCeMenuEntry', function () {
    it('should have get and set methods defined for each attribute and be cloned successfully', function () {

      // check setter and getter
      var _menuEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
      _menuEntry.setDescription('menu entry');
      expect(_menuEntry.getDescription()).toBe('menu entry');
      _menuEntry.setType('type');
      expect(_menuEntry.getType()).toBe('type');
      _menuEntry.setKey('7');
      expect(_menuEntry.getKey()).toBe('7');
      _menuEntry.setTimeout('5');
      expect(_menuEntry.getTimeout()).toBe('5');

      var _action = AutoAttendantCeMenuModelService.newCeActionEntry('name1', 'value1');
      _action.setDescription('description1');
      _menuEntry.addAction(_action);
      _action = AutoAttendantCeMenuModelService.newCeActionEntry('name2', 'value2');
      _action.setDescription('description2');
      _menuEntry.addAction(_action);
      expect(_menuEntry.actions.length).toBe(2);

      _menuEntry.setUsername('username');
      expect(_menuEntry.getUsername()).toBe('username');
      _menuEntry.setPassword('password');
      expect(_menuEntry.getPassword()).toBe('password');
      _menuEntry.setUrl('https://abc');
      expect(_menuEntry.getUrl()).toBe('https://abc');

      // check clone
      var _menuEntry2 = _menuEntry.clone();
      expect(angular.equals(_menuEntry, _menuEntry2)).toBe(true);

      // check that clone return a separate instance
      _menuEntry2.setUrl('https://abc2');
      expect(angular.equals(_menuEntry, _menuEntry2)).toBe(false);
    });
  });

  describe('newCeMenu', function () {
    it('should return an AARecord object', function () {
      var _ceMenu = AutoAttendantCeMenuModelService.newCeMenu();
      _ceMenu.setType('MENU_OPTION');
      _ceMenu.addHeader(AutoAttendantCeMenuModelService.newCeMenuEntry());
      _ceMenu.addEntry(AutoAttendantCeMenuModelService.newCeMenuEntry());
      expect(_ceMenu.getType()).toBe('MENU_OPTION');
      expect(_ceMenu.headers.length).toBe(1);
      expect(_ceMenu.entries.length).toBe(1);
    });
  });

  describe('updateScheduleActionSetMap', function () {
    it('should set scheduleActionSetMap attributes in AARecord object', function () {
      var _ceRecord = {};
      AutoAttendantCeMenuModelService.updateScheduleActionSetMap(_ceRecord, 'openHours');
      expect(angular.isDefined(_ceRecord.scheduleEventTypeMap)).toBe(true);
      expect(_ceRecord.scheduleEventTypeMap.open).toBe('openHours');

      _ceRecord = {};
      AutoAttendantCeMenuModelService.updateScheduleActionSetMap(_ceRecord, 'closedHours');
      expect(angular.isDefined(_ceRecord.scheduleEventTypeMap)).toBe(true);
      expect(_ceRecord.scheduleEventTypeMap.closed).toBe('closedHours');

      _ceRecord = {};
      AutoAttendantCeMenuModelService.updateScheduleActionSetMap(_ceRecord, 'holidays', 'closedHours');
      expect(angular.isDefined(_ceRecord.scheduleEventTypeMap)).toBe(true);
      expect(_ceRecord.scheduleEventTypeMap.holiday).toBe('closedHours');
    });
  });

  describe('updateDefaultActionSet', function () {
    it('should set defaultActionSet to closedHours in AARecord object', function () {
      var _ceRecord = {};
      AutoAttendantCeMenuModelService.updateDefaultActionSet(_ceRecord, true);
      expect(_ceRecord.defaultActionSet).toBe('closedHours');
    });

    it('should set defaultActionSet to openHours in AARecord object', function () {
      var _ceRecord = {};
      AutoAttendantCeMenuModelService.updateDefaultActionSet(_ceRecord, false);
      expect(_ceRecord.defaultActionSet).toBe('openHours');
    });

    it('should set defaultActionSet to openHours in AARecord object with hasClosedHours undefined', function () {
      var _ceRecord = {};
      AutoAttendantCeMenuModelService.updateDefaultActionSet(_ceRecord, undefined);
      expect(_ceRecord.defaultActionSet).toBe('openHours');
    });

    it('should not change defaultActionSet', function () {
      var _ceRecord = {
        defaultActionSet: 'test'
      };
      AutoAttendantCeMenuModelService.updateDefaultActionSet(_ceRecord, undefined);
      expect(_ceRecord.defaultActionSet).toBe('test');
    });
  });

  describe('deleteScheduleActionSetMap', function () {
    it('should delete defaultActionSet and associated scheduleEventTypeMap attribute in AARecord object', function () {
      var _ceRecord = {
        defaultActionSet: 'closedHours',
        scheduleEventTypeMap: {
          open: 'openHours',
          closed: 'closedHours',
          holiday: 'holidays'
        }
      };
      AutoAttendantCeMenuModelService.deleteScheduleActionSetMap(_ceRecord, 'closedHours');
      expect(angular.isUndefined(_ceRecord.scheduleEventTypeMap.closed)).toBe(true);

      AutoAttendantCeMenuModelService.deleteScheduleActionSetMap(_ceRecord, 'openHours');
      expect(angular.isUndefined(_ceRecord.scheduleEventTypeMap.open)).toBe(true);

      AutoAttendantCeMenuModelService.deleteScheduleActionSetMap(_ceRecord, 'holidays');
      expect(angular.isUndefined(_ceRecord.scheduleEventTypeMap.holiday)).toBe(true);
    });
  });
});
