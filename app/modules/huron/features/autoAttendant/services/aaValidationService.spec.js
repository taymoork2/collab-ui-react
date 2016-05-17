'use strict';

describe('Service: AAValidationService', function () {
  var AANotificationService, AAModelService, AutoAttendantCeInfoModelService, AAValidationService;

  var rawCeInfo = {
    "callExperienceName": "AAA2",
    "callExperienceURL": "https://ces.hitest.huron-dev.com/api/v1/customers/6662df48-b367-4c1e-9c3c-aa408aaa79a1/callExperiences/c16a6027-caef-4429-b3af-9d61ddc7964b",
    "assignedResources": [{
      "id": "00097a86-45ef-44a7-aa78-6d32a0ca1d3b",
      "type": "directoryNumber",
      "trigger": "incomingCall"
    }]
  };

  var aaModel = {};
  var data = getJSONFixture('huron/json/autoAttendant/aaPhoneMenuCtrl.json');

  function ce2CeInfo(rawCeInfo) {
    var _ceInfo = AutoAttendantCeInfoModelService.newCeInfo();
    for (var j = 0; j < rawCeInfo.assignedResources.length; j++) {
      var _resource = AutoAttendantCeInfoModelService.newResource();
      _resource.setId(rawCeInfo.assignedResources[j].id);
      _resource.setTrigger(rawCeInfo.assignedResources[j].trigger);
      _resource.setType(rawCeInfo.assignedResources[j].type);
      if (angular.isDefined(rawCeInfo.assignedResources[j].number)) {
        _resource.setNumber(rawCeInfo.assignedResources[j].number);
      }
      _ceInfo.addResource(_resource);
    }
    _ceInfo.setName(rawCeInfo.callExperienceName);
    _ceInfo.setCeUrl(rawCeInfo.callExperienceURL);
    return _ceInfo;
  }

  beforeEach(module('uc.autoattendant'));
  beforeEach(module('Huron'));

  beforeEach(inject(function (_AANotificationService_, _AutoAttendantCeInfoModelService_, _AAModelService_, _AAValidationService_) {
    AAModelService = _AAModelService_;
    AutoAttendantCeInfoModelService = _AutoAttendantCeInfoModelService_;
    AAValidationService = _AAValidationService_;
    AANotificationService = _AANotificationService_;

    spyOn(AAModelService, 'getAAModel').and.returnValue(aaModel);
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

      var ceInfo_name = "AAA3";
      var uuid = 'c16a6027-caef-4429-b3af-9d61ddc7964c';
      var valid = AAValidationService.isNameValidationSuccess(ceInfo_name, uuid);

      expect(valid).toEqual(true);
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
      ui.openHours = angular.copy(data.combinedMenu);

    });

    it('report validation success for a phone menu defined', function () {
      var valid = AAValidationService.isPhoneMenuValidationSuccess(ui);

      expect(valid).toEqual(true);
      expect(AANotificationService.error).not.toHaveBeenCalled();
    });

    it('report validation error for an empty Route to Auto Attendant target', function () {
      var uiPhoneMenu = ui.openHours.entries[0];
      var uiKey2 = uiPhoneMenu.entries[1];
      uiKey2.actions[0].value = "";
      var valid = AAValidationService.isPhoneMenuValidationSuccess(ui);

      expect(valid).toEqual(false);
      expect(AANotificationService.error).toHaveBeenCalled();
    });

    it('should not report validation error for an empty Route to Auto Attendant target if key is not initialized', function () {
      var uiPhoneMenu = ui.openHours.entries[0];
      var uiKey2 = uiPhoneMenu.entries[1];
      uiKey2.key = "";
      uiKey2.actions[0].value = "";
      var valid = AAValidationService.isPhoneMenuValidationSuccess(ui);

      expect(valid).toEqual(true);
      expect(AANotificationService.error).not.toHaveBeenCalled();
    });

    it('report validation error for an empty Route to Hunt Group target', function () {
      var uiPhoneMenu = ui.openHours.entries[0];
      var uiKey2 = uiPhoneMenu.entries[2];
      uiKey2.actions[0].value = "";
      var valid = AAValidationService.isPhoneMenuValidationSuccess(ui);

      expect(valid).toEqual(false);
      expect(AANotificationService.error).toHaveBeenCalled();
    });

    it('should not report validation error for an empty Route to Hunt Group target if key is not initialized', function () {
      var uiPhoneMenu = ui.openHours.entries[0];
      var uiKey2 = uiPhoneMenu.entries[2];
      uiKey2.key = "";
      uiKey2.actions[0].value = "";
      var valid = AAValidationService.isPhoneMenuValidationSuccess(ui);

      expect(valid).toEqual(true);
      expect(AANotificationService.error).not.toHaveBeenCalled();
    });

    it('report validation error for an empty Route to User target', function () {
      var uiPhoneMenu = ui.openHours.entries[0];
      var uiKey2 = uiPhoneMenu.entries[3];
      uiKey2.actions[0].value = "";
      var valid = AAValidationService.isPhoneMenuValidationSuccess(ui);

      expect(valid).toEqual(false);
      expect(AANotificationService.error).toHaveBeenCalled();
    });

    it('should not report validation error for an empty Route to User target if key is not initialized', function () {
      var uiPhoneMenu = ui.openHours.entries[0];
      var uiKey2 = uiPhoneMenu.entries[3];
      uiKey2.key = "";
      uiKey2.actions[0].value = "";
      var valid = AAValidationService.isPhoneMenuValidationSuccess(ui);

      expect(valid).toEqual(true);
      expect(AANotificationService.error).not.toHaveBeenCalled();
    });

    it('report validation error for an empty Route to Voicemail target', function () {
      var uiPhoneMenu = ui.openHours.entries[0];
      var uiKey2 = uiPhoneMenu.entries[4];
      uiKey2.actions[0].value = "";
      var valid = AAValidationService.isPhoneMenuValidationSuccess(ui);

      expect(valid).toEqual(false);
      expect(AANotificationService.error).toHaveBeenCalled();
    });

    it('should not report validation error for an empty Route to Voicemail target if key is not initialized', function () {
      var uiPhoneMenu = ui.openHours.entries[0];
      var uiKey2 = uiPhoneMenu.entries[4];
      uiKey2.key = "";
      uiKey2.actions[0].value = "";
      var valid = AAValidationService.isPhoneMenuValidationSuccess(ui);

      expect(valid).toEqual(true);
      expect(AANotificationService.error).not.toHaveBeenCalled();
    });

    it('report validation error for an empty Route to Phone Number target', function () {
      var uiPhoneMenu = ui.openHours.entries[0];
      var uiKey2 = uiPhoneMenu.entries[5];
      uiKey2.actions[0].value = "";
      var valid = AAValidationService.isPhoneMenuValidationSuccess(ui);

      expect(valid).toEqual(false);
      expect(AANotificationService.error).toHaveBeenCalled();
    });

    it('should not report validation error for an empty Route to Phone Number target if key is not initialized', function () {
      var uiPhoneMenu = ui.openHours.entries[0];
      var uiKey2 = uiPhoneMenu.entries[5];
      uiKey2.key = "";
      uiKey2.actions[0].value = "";
      var valid = AAValidationService.isPhoneMenuValidationSuccess(ui);

      expect(valid).toEqual(true);
      expect(AANotificationService.error).not.toHaveBeenCalled();
    });

    it('report validation error for an empty Route to Queue target', function () {
      var uiCombinedMenu = angular.copy(data.combinedMenu);
      var uiPhoneMenu = uiCombinedMenu.entries[0];
      var uiKey2 = uiPhoneMenu.entries[6];
      uiKey2.actions[0].value = "";
      var valid = AAValidationService.isPhoneMenuValidationSuccess(uiCombinedMenu);

    it('report validation error for an empty Route to Phone Number target Closed Hours', function () {
      ui.isClosedHours = true;
      ui.closedHours = angular.copy(data.combinedMenu);

      var uiPhoneMenu = ui.closedHours.entries[0];
      var uiKey2 = uiPhoneMenu.entries[5];
      uiKey2.actions[0].value = "";
      var valid = AAValidationService.isPhoneMenuValidationSuccess(ui);
      expect(valid).toEqual(false);
      expect(AANotificationService.error).toHaveBeenCalled();
    });
    
    it('should not report validation error for an empty Route to Queue target if key is not initialized', function () {
      var uiCombinedMenu = angular.copy(data.combinedMenu);
      var uiPhoneMenu = uiCombinedMenu.entries[0];
      var uiKey2 = uiPhoneMenu.entries[6];
      uiKey2.actions[0].value = "Test Queue";
      var valid = AAValidationService.isPhoneMenuValidationSuccess(uiCombinedMenu);
      expect(valid).toEqual(true);
      expect(AANotificationService.error).not.toHaveBeenCalled();
    });

    it('report 2 validation error for an empty Route to Phone Number target Closed/Open Hours', function () {
      ui.isClosedHours = true;
      ui.closedHours = angular.copy(data.combinedMenu);

      var uiPhoneMenu = ui.closedHours.entries[0];
      var uiKey2 = uiPhoneMenu.entries[5];
      uiKey2.actions[0].value = "";

      uiPhoneMenu = ui.openHours.entries[0];
      uiKey2 = uiPhoneMenu.entries[5];
      uiKey2.actions[0].value = "";

      var valid = AAValidationService.isPhoneMenuValidationSuccess(ui);

      expect(valid).toEqual(false);
      expect(AANotificationService.error).toHaveBeenCalled();
      expect(AANotificationService.error.calls.count()).toEqual(2);
    });
    it('report 2 validation error for 2 empty Route to Phone Number target Open Hours', function () {
      var uiPhoneMenu = ui.openHours.entries[0];
      var uiKey2 = uiPhoneMenu.entries[5];
      uiKey2.actions[0].value = "";

      ui.openHours.entries.push(uiPhoneMenu);

      var valid = AAValidationService.isPhoneMenuValidationSuccess(ui);

      expect(valid).toEqual(false);
      expect(AANotificationService.error).toHaveBeenCalled();
      expect(AANotificationService.error.calls.count()).toEqual(2);

    });

    it('report 3 validation error for an empty Route to Phone Number target Closed/Open/Hoilday Hours', function () {
      ui.isClosedHours = true;
      ui.closedHours = angular.copy(data.combinedMenu);

      var uiPhoneMenu = ui.closedHours.entries[0];
      var uiKey2 = uiPhoneMenu.entries[5];
      uiKey2.actions[0].value = "";

      uiPhoneMenu = ui.openHours.entries[0];
      uiKey2 = uiPhoneMenu.entries[5];
      uiKey2.actions[0].value = "";

      ui.isHolidays = true;
      ui.holidays = angular.copy(data.combinedMenu);
      uiKey2 = uiPhoneMenu.entries[3];
      uiKey2.actions[0].value = "";

      var valid = AAValidationService.isPhoneMenuValidationSuccess(ui);

      expect(valid).toEqual(false);
      expect(AANotificationService.error).toHaveBeenCalled();
      expect(AANotificationService.error.calls.count()).toEqual(3);

    });

  });

});
