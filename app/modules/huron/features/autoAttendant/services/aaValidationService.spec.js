'use strict';

describe('Service: AAValidationService', function () {
  var AANotificationService, AAModelService, AutoAttendantCeInfoModelService, AAValidationService, AACommonService, AutoAttendantCeMenuModelService, AAUtilityService;

  var rawCeInfo = {
    callExperienceName: 'AAA2',
    callExperienceURL: 'https://ces.hitest.huron-dev.com/api/v1/customers/6662df48-b367-4c1e-9c3c-aa408aaa79a1/callExperiences/c16a6027-caef-4429-b3af-9d61ddc7964b',
    assignedResources: [{
      id: '00097a86-45ef-44a7-aa78-6d32a0ca1d3b',
      type: 'directoryNumber',
      trigger: 'incomingCall',
    }],
  };

  var aaModel = {};
  var data = getJSONFixture('huron/json/autoAttendant/aaPhoneMenuCtrl.json');
  var welcomeMenu = getJSONFixture('huron/json/autoAttendant/welcomeMenu.json');

  function KeyAction() {
    this.key = '';
    this.value = '';
    this.keys = [];
  }

  function ce2CeInfo(rawCeInfo) {
    var _ceInfo = AutoAttendantCeInfoModelService.newCeInfo();
    for (var j = 0; j < rawCeInfo.assignedResources.length; j++) {
      var _resource = AutoAttendantCeInfoModelService.newResource();
      _resource.setId(rawCeInfo.assignedResources[j].id);
      _resource.setTrigger(rawCeInfo.assignedResources[j].trigger);
      _resource.setType(rawCeInfo.assignedResources[j].type);
      if (!_.isUndefined(rawCeInfo.assignedResources[j].number)) {
        _resource.setNumber(rawCeInfo.assignedResources[j].number);
      }
      _ceInfo.addResource(_resource);
    }
    _ceInfo.setName(rawCeInfo.callExperienceName);
    _ceInfo.setCeUrl(rawCeInfo.callExperienceURL);
    return _ceInfo;
  }

  beforeEach(angular.mock.module('uc.autoattendant'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));

  beforeEach(inject(function (_AANotificationService_, _AutoAttendantCeInfoModelService_, _AAModelService_, _AutoAttendantCeMenuModelService_, _AAValidationService_, _AACommonService_, _AAUtilityService_) {
    AAModelService = _AAModelService_;
    AutoAttendantCeInfoModelService = _AutoAttendantCeInfoModelService_;
    AAValidationService = _AAValidationService_;
    AANotificationService = _AANotificationService_;
    AACommonService = _AACommonService_;
    AutoAttendantCeMenuModelService = _AutoAttendantCeMenuModelService_;
    AAUtilityService = _AAUtilityService_;

    spyOn(AAModelService, 'getAAModel').and.returnValue(aaModel);
    spyOn(AAUtilityService, 'countOccurences').and.returnValue(0);
  }));

  afterEach(function () {

  });

  describe('isNameValidationSuccess', function () {
    beforeEach(function () {
      spyOn(AANotificationService, 'error');
      aaModel.ceInfos = [];
      aaModel.aaRecords = [];
    });

    it('report name validation error for uuid undefined', function () {
      // when aaModel.aaRecord is defined
      var ceInfo_name = 'AA';
      var uuid = undefined;
      var valid = AAValidationService.isNameValidationSuccess(ceInfo_name, uuid);

      expect(valid).toEqual(false);
    });

    it('report name validation error for an empty string', function () {
      // when aaModel.aaRecord is defined
      var ceInfo_name = '';
      var uuid = '';
      var valid = AAValidationService.isNameValidationSuccess(ceInfo_name, uuid);

      expect(valid).toEqual(false);
      expect(AANotificationService.error).toHaveBeenCalled();
    });

    it('report name validation error for a string of spaces', function () {
      var ceInfo_name = '   ';
      var uuid = '';
      var valid = AAValidationService.isNameValidationSuccess(ceInfo_name, uuid);

      expect(valid).toEqual(false);
      expect(AANotificationService.error).toHaveBeenCalled();
    });

    it('should report name validation error if new AA name is not unique', function () {
      var ceInfo = ce2CeInfo(rawCeInfo);
      aaModel.ceInfos.push(ceInfo);

      var ceInfo_name = 'AAA2';
      var uuid = 'c16a6027-caef-4429-b3af-9d61ddc7964c';
      var valid = AAValidationService.isNameValidationSuccess(ceInfo_name, uuid);

      expect(valid).toEqual(false);
      expect(AANotificationService.error).toHaveBeenCalled();
    });

    it('should report name validation success if new AA name is unique', function () {
      var ceInfo = ce2CeInfo(rawCeInfo);
      aaModel.ceInfos.push(ceInfo);

      var ceInfo_name = 'AAA3';
      var uuid = 'c16a6027-caef-4429-b3af-9d61ddc7964c';
      var valid = AAValidationService.isNameValidationSuccess(ceInfo_name, uuid);

      expect(valid).toEqual(true);
    });
  });

  describe('isCallerInputValidationSuccess', function () {
    var ui;
    beforeEach(function () {
      spyOn(AANotificationService, 'error');
      aaModel.ceInfos = [];
      aaModel.aaRecords = [];
      ui = {};
      ui.isOpenHours = true;

      ui.openHours = AutoAttendantCeMenuModelService.newCeMenu();
    });

    it('should report Variable Name is blank validation', function () {
      var valid;
      var entry = AutoAttendantCeMenuModelService.newCeMenuEntry();

      var actionEntry = AutoAttendantCeMenuModelService.newCeActionEntry('runActionsOnInput', '');

      actionEntry.inputType = 3;
      actionEntry.variableName = '';
      entry.addAction(actionEntry);

      ui.openHours.addEntryAt(0, entry);

      valid = AAValidationService.isValidCES(ui);

      expect(valid).toEqual(false);
      expect(AANotificationService.error).toHaveBeenCalled();
      expect(AANotificationService.error.calls.argsFor(0)).toEqual(['autoAttendant.callerInputMenuErrorVariableNameMissing', {
        schedule: 'autoAttendant.scheduleOpen',
        at: 1,
      }]);
    });

    it('should report Variable Name is blank validation for menu two', function () {
      var valid;
      var entry1 = AutoAttendantCeMenuModelService.newCeMenuEntry();
      var entry2 = AutoAttendantCeMenuModelService.newCeMenuEntry();

      var actionEntry1 = AutoAttendantCeMenuModelService.newCeActionEntry('runActionsOnInput', '');
      var actionEntry2 = AutoAttendantCeMenuModelService.newCeActionEntry('runActionsOnInput', '');

      actionEntry1.inputType = 3;
      actionEntry1.variableName = 'my variable';
      entry1.addAction(actionEntry1);


      actionEntry2.inputType = 3;
      actionEntry2.variableName = '';
      entry2.addAction(actionEntry2);

      ui.openHours.addEntryAt(0, entry1);
      ui.openHours.addEntryAt(1, entry2);

      valid = AAValidationService.isValidCES(ui);

      expect(valid).toEqual(false);
      expect(AANotificationService.error.calls.argsFor(0)).toEqual(['autoAttendant.callerInputMenuErrorVariableNameMissing', {
        schedule: 'autoAttendant.scheduleOpen',
        at: 2,
      }]);
    });

    it('should not report Variable Name is blank', function () {
      var valid;
      var entry = AutoAttendantCeMenuModelService.newCeMenuEntry();

      var actionEntry = AutoAttendantCeMenuModelService.newCeActionEntry('runActionsOnInput', '');

      actionEntry.inputType = 3;
      actionEntry.variableName = 'my variable name';
      entry.addAction(actionEntry);

      ui.openHours.addEntryAt(0, entry);

      valid = AAValidationService.isValidCES(ui);

      expect(valid).toEqual(true);
      expect(AANotificationService.error).not.toHaveBeenCalled();
    });

    it('should report No errors when at least one input value is entered', function () {
      var goodKey = new KeyAction();

      var valid;
      var entry = AutoAttendantCeMenuModelService.newCeMenuEntry();

      var actionEntry = AutoAttendantCeMenuModelService.newCeActionEntry('runActionsOnInput', '');

      actionEntry.inputType = 4;
      actionEntry.variableName = 'my variable name';
      goodKey.value = 'my value';
      actionEntry.inputActions = [];
      actionEntry.inputActions.push(new KeyAction());
      actionEntry.inputActions.push(new KeyAction());
      actionEntry.inputActions.push(goodKey);

      entry.addAction(actionEntry);

      ui.openHours.addEntryAt(0, entry);

      valid = AAValidationService.isValidCES(ui);

      expect(valid).toEqual(true);
      expect(AANotificationService.error).not.toHaveBeenCalled();
    });
  });

  describe('isPhoneMenuValidationSuccess', function () {
    var ui;
    beforeEach(function () {
      spyOn(AANotificationService, 'error');
      aaModel.ceInfos = [];
      aaModel.aaRecords = [];
      ui = {};
      ui.isOpenHours = true;
      ui.openHours = _.cloneDeep(data.combinedMenu);
    });

    it('report validation success for a phone menu defined', function () {
      var valid = AAValidationService.isValidCES(ui);

      expect(valid).toEqual(true);
      expect(AANotificationService.error).not.toHaveBeenCalled();
    });

    it('report validation error for an empty Route to Auto Attendant target', function () {
      var uiPhoneMenu = ui.openHours.entries[0];
      var uiKey2 = uiPhoneMenu.entries[1];
      uiKey2.actions[0].value = '';
      var valid = AAValidationService.isValidCES(ui);

      expect(valid).toEqual(false);
      expect(AANotificationService.error).toHaveBeenCalled();
    });
    it('report validation error for an empty Route to Auto Attendant target in Submenu', function () {
      var topMenu, subMenu;

      ui = {};
      ui.isOpenHours = true;
      ui.openHours = AutoAttendantCeMenuModelService.newCeMenu();

      subMenu = AutoAttendantCeMenuModelService.newCeMenu();
      topMenu = AutoAttendantCeMenuModelService.newCeMenu();
      topMenu.setType('MENU_OPTION');

      ui.openHours.addEntryAt(0, topMenu);

      subMenu.setType('MENU_OPTION');

      // ui.openHours.entries[0].addEntryAt(0, subMenu);
      topMenu.addEntryAt(0, subMenu);
      topMenu.entries[0].key = '0';

      subMenu.addEntryAt(0, AutoAttendantCeMenuModelService.newCeMenuEntry());

      var actionEntry = AutoAttendantCeMenuModelService.newCeActionEntry('goto', '');

      subMenu.entries[0].setKey('2');

      subMenu.entries[0].addAction(actionEntry);

      var valid = AAValidationService.isValidCES(ui);

      expect(valid).toEqual(false);

      expect(AANotificationService.error.calls.argsFor(0)).toEqual(['autoAttendant.phoneMenuSubmenuErrorTargetMissing', {
        schedule: 'autoAttendant.scheduleOpen',
        at: 1,
      }]);

      expect(AANotificationService.error).toHaveBeenCalled();
    });

    it('should not report a validation error for an valid Route to Auto Attendant target in Submenu', function () {
      var topMenu, subMenu;

      ui = {};
      ui.isOpenHours = true;
      ui.openHours = AutoAttendantCeMenuModelService.newCeMenu();

      subMenu = AutoAttendantCeMenuModelService.newCeMenu();
      topMenu = AutoAttendantCeMenuModelService.newCeMenu();
      topMenu.setType('MENU_OPTION');

      ui.openHours.addEntryAt(0, topMenu);

      subMenu.setType('MENU_OPTION');

      // ui.openHours.entries[0].addEntryAt(0, subMenu);
      topMenu.addEntryAt(0, subMenu);
      topMenu.entries[0].key = '0';

      subMenu.addEntryAt(0, AutoAttendantCeMenuModelService.newCeMenuEntry());

      var actionEntry = AutoAttendantCeMenuModelService.newCeActionEntry('goto', 'routeToNoWhere');

      subMenu.entries[0].setKey('2');

      subMenu.entries[0].addAction(actionEntry);

      var valid = AAValidationService.isValidCES(ui);

      expect(valid).toEqual(true);

      expect(AANotificationService.error).not.toHaveBeenCalled();
    });

    it('should report a validation error for an empty target in Submenu', function () {
      var topMenu, subMenu;

      ui = {};
      ui.isOpenHours = true;
      ui.openHours = AutoAttendantCeMenuModelService.newCeMenu();

      subMenu = AutoAttendantCeMenuModelService.newCeMenu();
      topMenu = AutoAttendantCeMenuModelService.newCeMenu();
      topMenu.setType('MENU_OPTION');

      ui.openHours.addEntryAt(0, topMenu);

      subMenu.setType('MENU_OPTION');

      // ui.openHours.entries[0].addEntryAt(0, subMenu);
      topMenu.addEntryAt(0, subMenu);
      topMenu.entries[0].key = '0';

      var valid = AAValidationService.isValidCES(ui);

      expect(valid).toEqual(false);

      expect(AANotificationService.error).toHaveBeenCalled();
    });
    it('should not report validation error for valid Route to Auto Attendant target in Submenu', function () {
      var topMenu, subMenu;

      ui = {};
      ui.isOpenHours = true;
      ui.openHours = AutoAttendantCeMenuModelService.newCeMenu();

      subMenu = AutoAttendantCeMenuModelService.newCeMenu();
      topMenu = AutoAttendantCeMenuModelService.newCeMenu();
      topMenu.setType('MENU_OPTION');

      ui.openHours.addEntryAt(0, topMenu);

      subMenu.setType('MENU_OPTION');

      ui.openHours.entries[0].addEntryAt(0, subMenu);
      subMenu.addEntryAt(0, AutoAttendantCeMenuModelService.newCeMenuEntry());

      var actionEntry = AutoAttendantCeMenuModelService.newCeActionEntry('goto', 'AAAAA');
      subMenu.entries[0].setKey('0');

      subMenu.entries[0].addAction(actionEntry);

      // ui.openHours.entries[0].setType("MENU_OPTION");
      // ui.openHours.entries[0].entries[0].setType("MENU_OPTION");
      // ui.openHours.entries[0].entries[0].key = "0";
      ui.openHours.entries[0].entries[0].entries[0].setType('MENU_OPTION');
      ui.openHours.entries[0].entries[0].entries[0].setKey('1');

      var valid = AAValidationService.isValidCES(ui);

      expect(valid).toEqual(true);

      expect(AANotificationService.error).not.toHaveBeenCalled();
    });

    it('should not report validation error for an empty Route to Auto Attendant target if key is not initialized', function () {
      var uiPhoneMenu = ui.openHours.entries[0];
      var uiKey2 = uiPhoneMenu.entries[1];
      uiKey2.key = '';
      uiKey2.actions[0].value = '';
      var valid = AAValidationService.isValidCES(ui);

      expect(valid).toEqual(true);
      expect(AANotificationService.error).not.toHaveBeenCalled();
    });

    it('report validation error for an empty Route to Hunt Group target', function () {
      var uiPhoneMenu = ui.openHours.entries[0];
      var uiKey2 = uiPhoneMenu.entries[2];
      uiKey2.actions[0].value = '';
      var valid = AAValidationService.isValidCES(ui);

      expect(valid).toEqual(false);
      expect(AANotificationService.error).toHaveBeenCalled();
    });

    it('should not report validation error for an empty Route to Hunt Group target if key is not initialized', function () {
      var uiPhoneMenu = ui.openHours.entries[0];
      var uiKey2 = uiPhoneMenu.entries[2];
      uiKey2.key = '';
      uiKey2.actions[0].value = '';
      var valid = AAValidationService.isValidCES(ui);

      expect(valid).toEqual(true);
      expect(AANotificationService.error).not.toHaveBeenCalled();
    });
    it('should report validation error for a Phone Menu with no entries', function () {
      var uiPhoneMenu = ui.openHours.entries[0];
      uiPhoneMenu.entries.length = 1;

      var uiKey2 = uiPhoneMenu.entries[0];
      uiKey2.key = '';
      uiKey2.actions[0].value = '';
      uiKey2.actions[0].name = '';
      var valid = AAValidationService.isValidCES(ui);

      expect(valid).toEqual(true);

      uiPhoneMenu.entries.length = 0;

      valid = AAValidationService.isValidCES(ui);

      expect(valid).toEqual(true);
    });

    it('report validation error for an empty Route to User target', function () {
      var uiPhoneMenu = ui.openHours.entries[0];
      var uiKey2 = uiPhoneMenu.entries[3];
      uiKey2.actions[0].value = '';
      var valid = AAValidationService.isValidCES(ui);

      expect(valid).toEqual(false);
      expect(AANotificationService.error).toHaveBeenCalled();
    });

    it('should not report validation error for an empty Route to User target if key is not initialized', function () {
      var uiPhoneMenu = ui.openHours.entries[0];
      var uiKey2 = uiPhoneMenu.entries[3];
      uiKey2.key = '';
      uiKey2.actions[0].value = '';
      var valid = AAValidationService.isValidCES(ui);

      expect(valid).toEqual(true);
      expect(AANotificationService.error).not.toHaveBeenCalled();
    });

    it('report validation error for an empty Route to Voicemail target', function () {
      var uiPhoneMenu = ui.openHours.entries[0];
      var uiKey2 = uiPhoneMenu.entries[4];
      uiKey2.actions[0].value = '';
      var valid = AAValidationService.isValidCES(ui);

      expect(valid).toEqual(false);
      expect(AANotificationService.error).toHaveBeenCalled();
    });

    it('should not report validation error for an empty Route to Voicemail target if key is not initialized', function () {
      var uiPhoneMenu = ui.openHours.entries[0];
      var uiKey2 = uiPhoneMenu.entries[4];
      uiKey2.key = '';
      uiKey2.actions[0].value = '';
      var valid = AAValidationService.isValidCES(ui);

      expect(valid).toEqual(true);
      expect(AANotificationService.error).not.toHaveBeenCalled();
    });

    it('report no validation error for a Route to Phone Number target', function () {
      var uiPhoneMenu = ui.openHours.entries[0];
      var uiKey2 = uiPhoneMenu.entries[5];
      uiKey2.actions[0].value = '';

      spyOn(AACommonService, 'getInvalid').and.returnValue(undefined);

      var valid = AAValidationService.isValidCES(ui);

      expect(valid).toEqual(true);
      expect(AANotificationService.error).not.toHaveBeenCalled();
    });
    it('should report validation error for an invalid Route to Phone Number target', function () {
      spyOn(AACommonService, 'getInvalid').and.returnValue(false);

      var uiPhoneMenu = ui.openHours.entries[0];
      var uiKey2 = uiPhoneMenu.entries[5];
      uiKey2.actions[0].value = 'XXxX';
      var valid = AAValidationService.isValidCES(ui);

      expect(valid).toEqual(false);
      expect(AANotificationService.error).toHaveBeenCalled();
    });

    it('should not report validation error for an empty Route to Phone Number target if key is not initialized', function () {
      var uiPhoneMenu = ui.openHours.entries[0];
      var uiKey2 = uiPhoneMenu.entries[5];
      uiKey2.key = '';
      uiKey2.actions[0].value = '';
      var valid = AAValidationService.isValidCES(ui);

      expect(valid).toEqual(true);
      expect(AANotificationService.error).not.toHaveBeenCalled();
    });

    it('report validation error for an empty Route to Queue target', function () {
      var uiPhoneMenu = ui.openHours.entries[0];
      var uiKey2 = uiPhoneMenu.entries[6];
      uiKey2.actions[0].value = '';
      var valid = AAValidationService.isValidCES(ui);
      expect(valid).toEqual(false);
      expect(AANotificationService.error).toHaveBeenCalled();
    });

    it('report validation error for an empty Route to Phone Number target Closed Hours', function () {
      ui.isClosedHours = true;
      ui.closedHours = _.cloneDeep(data.combinedMenu);

      var uiPhoneMenu = ui.closedHours.entries[0];
      var uiKey2 = uiPhoneMenu.entries[5];
      uiKey2.actions[0].value = 'dummy';

      spyOn(AACommonService, 'getInvalid').and.returnValue(false);

      var valid = AAValidationService.isValidCES(ui);

      expect(valid).toEqual(false);
      expect(AANotificationService.error).toHaveBeenCalled();
    });

    it('should not report validation error for an empty Route to Queue target if key is not initialized', function () {
      var uiPhoneMenu = ui.openHours.entries[0];
      var uiKey2 = uiPhoneMenu.entries[6];
      uiKey2.key = '';
      uiKey2.actions[0].value = 'Test Queue';
      var valid = AAValidationService.isValidCES(ui);

      expect(valid).toEqual(true);
      expect(AANotificationService.error).not.toHaveBeenCalled();

      /* var uiCombinedMenu = _.cloneDeep(data.combinedMenu);
       var uiPhoneMenu = uiCombinedMenu.entries[0];
       var uiKey2 = uiPhoneMenu.entries[6];
       uiKey2.actions[0].value = "Test Queue";
       var valid = AAValidationService.isValidCES(uiCombinedMenu);
       expect(valid).toEqual(true);
       expect(AANotificationService.error).not.toHaveBeenCalled();*/
    });

    it('report 2 validation error for an empty Route to Phone Number target Closed/Open Hours', function () {
      ui.isClosedHours = true;
      ui.closedHours = _.cloneDeep(data.combinedMenu);

      var uiPhoneMenu = ui.closedHours.entries[0];
      var uiKey2 = uiPhoneMenu.entries[5];
      uiKey2.actions[0].value = '';

      uiPhoneMenu = ui.openHours.entries[0];
      uiKey2 = uiPhoneMenu.entries[5];
      uiKey2.actions[0].value = '';

      spyOn(AACommonService, 'getInvalid').and.returnValue(false);

      var valid = AAValidationService.isValidCES(ui);

      expect(valid).toEqual(false);
      expect(AANotificationService.error).toHaveBeenCalled();
      expect(AANotificationService.error.calls.count()).toEqual(2);
    });
    it('report 2 validation error for 2 empty Route to Phone Number target Open Hours', function () {
      var uiPhoneMenu = ui.openHours.entries[0];
      var uiKey2 = uiPhoneMenu.entries[5];
      uiKey2.actions[0].value = '';

      ui.openHours.entries.push(uiPhoneMenu);

      spyOn(AACommonService, 'getInvalid').and.returnValue(false);

      var valid = AAValidationService.isValidCES(ui);

      expect(valid).toEqual(false);
      expect(AANotificationService.error).toHaveBeenCalled();
      expect(AANotificationService.error.calls.count()).toEqual(2);
    });

    it('report 3 validation error for an empty Route to Phone Number target Closed/Open/Holiday Hours', function () {
      ui.isClosedHours = true;
      ui.closedHours = _.cloneDeep(data.combinedMenu);

      var uiPhoneMenu = ui.closedHours.entries[0];
      var uiKey2 = uiPhoneMenu.entries[5];
      uiKey2.actions[0].value = '';

      uiPhoneMenu = ui.openHours.entries[0];
      uiKey2 = uiPhoneMenu.entries[5];
      uiKey2.actions[0].value = '';

      ui.isHolidays = true;
      ui.holidays = _.cloneDeep(data.combinedMenu);

      spyOn(AACommonService, 'getInvalid').and.returnValue(false);

      var valid = AAValidationService.isValidCES(ui);

      expect(valid).toEqual(false);
      expect(AANotificationService.error).toHaveBeenCalled();
      expect(AANotificationService.error.calls.count()).toEqual(3);
    });
  });

  describe('isRouteCallValidationSuccess', function () {
    var ui;
    beforeEach(function () {
      spyOn(AANotificationService, 'error');

      aaModel.ceInfos = [];
      aaModel.aaRecords = [];
      ui = {};
      ui.isOpenHours = true;
      ui.openHours = _.cloneDeep(data.combinedMenu);
    });

    it('report success for a Route Call Route with a VoiceMail target', function () {
      ui.isOpenHours = true;
      ui.openHours = _.cloneDeep(welcomeMenu.welcomeMenu);

      var routeTo = _.find(ui.openHours.entries, function (entry) {
        return entry.actions[0].name === 'routeToVoiceMail';
      });

      routeTo.actions[0].value = 'UserVoiceMail';

      var valid = AAValidationService.isValidCES(ui);

      expect(valid).toEqual(true);
      expect(AANotificationService.error).not.toHaveBeenCalled();
    });

    it('report success and ignore Say Message without a value', function () {
      ui.isOpenHours = true;
      ui.openHours = _.cloneDeep(welcomeMenu.welcomeMenu);

      var sayMsg = _.find(ui.openHours.entries, function (entry) {
        return entry.actions[0].name === 'say';
      });

      sayMsg.actions[0].value = '';

      var valid = AAValidationService.isValidCES(ui);

      expect(valid).toEqual(true);
      expect(AANotificationService.error).not.toHaveBeenCalled();
    });

    it('report 1 validation error for an empty Route Call Route to VoiceMail target', function () {
      ui.isOpenHours = true;
      ui.openHours = _.cloneDeep(welcomeMenu.welcomeMenu);

      var routeTo = _.find(ui.openHours.entries, function (entry) {
        return entry.actions[0].name === 'routeToVoiceMail';
      });

      routeTo.actions[0].value = '';

      var valid = AAValidationService.isValidCES(ui);

      expect(valid).toEqual(false);
      expect(AANotificationService.error).toHaveBeenCalled();
      expect(AANotificationService.error).toHaveBeenCalledWith(
        'autoAttendant.routeCallErrorRouteToVoicemailTargetMissing', jasmine.any(Object));
    });

    it('report 1 validation error for an empty Route Call Route to User target', function () {
      ui.isOpenHours = true;
      ui.openHours = _.cloneDeep(welcomeMenu.welcomeMenu);

      var routeTo = _.find(ui.openHours.entries, function (entry) {
        return entry.actions[0].name === 'routeToUser';
      });

      routeTo.actions[0].value = '';

      var valid = AAValidationService.isValidCES(ui);

      expect(valid).toEqual(false);
      expect(AANotificationService.error).toHaveBeenCalled();
      expect(AANotificationService.error).toHaveBeenCalledWith(
        'autoAttendant.routeCallErrorRouteToUserTargetMissing', jasmine.any(Object));
    });

    it('report 1 validation error for an empty Route Call Route to Hunt Group target', function () {
      ui.isOpenHours = true;
      ui.openHours = _.cloneDeep(welcomeMenu.welcomeMenu);

      var routeTo = _.find(ui.openHours.entries, function (entry) {
        return entry.actions[0].name === 'routeToHuntGroup';
      });

      routeTo.actions[0].value = '';

      var valid = AAValidationService.isValidCES(ui);

      expect(valid).toEqual(false);
      expect(AANotificationService.error).toHaveBeenCalled();
      expect(AANotificationService.error).toHaveBeenCalledWith(
        'autoAttendant.routeCallErrorRouteToHGTargetMissing', jasmine.any(Object));
    });

    it('report 1 validation error for an empty Route Call Route to Auto Attendant target', function () {
      ui.isOpenHours = true;
      ui.openHours = _.cloneDeep(welcomeMenu.welcomeMenu);

      var routeTo = _.find(ui.openHours.entries, function (entry) {
        return entry.actions[0].name === 'goto';
      });

      routeTo.actions[0].value = '';

      var valid = AAValidationService.isValidCES(ui);

      expect(valid).toEqual(false);
      expect(AANotificationService.error).toHaveBeenCalled();
      expect(AANotificationService.error).toHaveBeenCalledWith(
        'autoAttendant.routeCallErrorRouteToAATargetMissing', jasmine.any(Object));
    });

    it('report 1 validation error for an empty Route Call Route to Phone Number target', function () {
      ui.isOpenHours = true;
      ui.openHours = _.cloneDeep(welcomeMenu.welcomeMenu);

      var routeTo = _.find(ui.openHours.entries, function (entry) {
        return entry.actions[0].name === 'route';
      });

      routeTo.actions[0].value = 'anything';

      spyOn(AACommonService, 'getInvalid').and.returnValue(false);

      var valid = AAValidationService.isValidCES(ui);

      expect(valid).toEqual(false);
      expect(AANotificationService.error).toHaveBeenCalledWith(
        'autoAttendant.routeCallErrorRouteToPhoneNumberTargetMissing', jasmine.any(Object));
    });

    it('report 1 validation error for Route Call with invalid number for Route to Phone Number target', function () {
      spyOn(AACommonService, 'getInvalid').and.returnValue(false);

      ui.isOpenHours = true;
      ui.openHours = _.cloneDeep(welcomeMenu.welcomeMenu);

      var routeTo = _.find(ui.openHours.entries, function (entry) {
        return entry.actions[0].name === 'route';
      });

      routeTo.actions[0].value = 'XXXX';

      var valid = AAValidationService.isValidCES(ui);

      expect(valid).toEqual(false);
      expect(AANotificationService.error).toHaveBeenCalledWith(
        'autoAttendant.routeCallErrorRouteToPhoneNumberTargetMissing', jasmine.any(Object));
    });

    it('report 5 validation error for an empty Route Call target', function () {
      ui.isOpenHours = true;
      ui.openHours = _.cloneDeep(welcomeMenu.welcomeMenu);

      var routeTo = _.find(ui.openHours.entries, function (entry) {
        return entry.actions[0].name === 'route';
      });

      routeTo.actions[0].value = '';

      routeTo = _.find(ui.openHours.entries, function (entry) {
        return entry.actions[0].name === 'goto';
      });

      routeTo.actions[0].value = '';

      routeTo = _.find(ui.openHours.entries, function (entry) {
        return entry.actions[0].name === 'routeToUser';
      });

      routeTo.actions[0].value = '';

      routeTo = _.find(ui.openHours.entries, function (entry) {
        return entry.actions[0].name === 'routeToVoiceMail';
      });

      routeTo.actions[0].value = '';

      routeTo = _.find(ui.openHours.entries, function (entry) {
        return entry.actions[0].name === 'routeToHuntGroup';
      });

      routeTo.actions[0].value = '';

      spyOn(AACommonService, 'getInvalid').and.returnValue(false);

      var valid = AAValidationService.isValidCES(ui);

      expect(valid).toEqual(false);
      expect(AANotificationService.error).toHaveBeenCalled();
      expect(AANotificationService.error.calls.count()).toEqual(5);
    });
  });
});
