'use strict';

describe('Service:AACommonService', function () {
  var AACommonService, AutoAttendantCeMenuModelService;

  var ui = {};
  var aaRecord = {};

  var sortedOptions = [{
    title: 'autoAttendant.actionPhoneMenu',
    label: 'AutoAttendantTestLabel',
  }, {
    title: 'autoAttendant.actionRouteCall',
    label: 'autoAttendantTestLabel',
  }, {
    title: 'autoAttendant.actionSayMessage',
    label: 'secondTestLabel',
  }, {
    title: 'autoAttendant.phoneMenuDialExt',
    label: 'testLabel',
  }];

  var unSortedOptions = [{
    title: 'autoAttendant.actionRouteCall',
    label: 'testLabel',
  }, {
    title: 'autoAttendant.phoneMenuDialExt',
    label: 'autoAttendantTestLabel',
  }, {
    title: 'autoAttendant.actionSayMessage',
    label: 'AutoAttendantTestLabel',
  }, {
    title: 'autoAttendant.actionPhoneMenu',
    label: 'secondTestLabel',
  }];


  beforeEach(angular.mock.module('uc.autoattendant'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(inject(function (_AACommonService_, _AutoAttendantCeMenuModelService_) {
    AACommonService = _AACommonService_;
    AutoAttendantCeMenuModelService = _AutoAttendantCeMenuModelService_;
  }));

  afterEach(function () {
    AACommonService = null;
    AutoAttendantCeMenuModelService = null;
  });

  describe('AACommonService services', function () {
    it('setSayMessageStatus should set to false', function () {
      AACommonService.setSayMessageStatus(false);
      expect(AACommonService.isFormDirty()).toBeFalsy();
    });

    it('setSayMessageStatus should set to true', function () {
      AACommonService.setSayMessageStatus(true);
      expect(AACommonService.isFormDirty()).toBeTruthy();
    });

    it('resetFormStatus should reset the flags', function () {
      AACommonService.resetFormStatus();
      expect(AACommonService.isFormDirty()).toBeFalsy();
    });

    it('setPhoneMenuStatus should be true', function () {
      AACommonService.setPhoneMenuStatus(true);
      expect(AACommonService.isFormDirty()).toBeTruthy();
    });

    it('setPhoneMenuStatus should be false', function () {
      AACommonService.setPhoneMenuStatus(false);
      expect(AACommonService.isFormDirty()).toBeFalsy();
    });

    it('setActionStatus should be true', function () {
      AACommonService.setActionStatus(true);
      expect(AACommonService.isFormDirty()).toBeTruthy();
    });
    it('setActionStatus should be false', function () {
      AACommonService.setActionStatus(false);
      expect(AACommonService.isFormDirty()).toBeFalsy();
    });
    it('setCENumberStatus should be true', function () {
      AACommonService.setCENumberStatus(true);
      expect(AACommonService.isFormDirty()).toBeTruthy();
    });
    it('setCENumberStatus should be false', function () {
      AACommonService.setCENumberStatus(false);
      expect(AACommonService.isFormDirty()).toBeFalsy();
    });
    it('setDialByExtensionStatus should be false', function () {
      AACommonService.setDialByExtensionStatus(false);
      expect(AACommonService.isFormDirty()).toBeFalsy();
    });
    it('setDialByExtensionStatus should be true', function () {
      AACommonService.setDialByExtensionStatus(true);
      expect(AACommonService.isFormDirty()).toBeTruthy();
    });
    it('setMediaUploadStatus should be false', function () {
      AACommonService.setMediaUploadStatus(false);
      expect(AACommonService.isFormDirty()).toBeFalsy();
    });
    it('setMediaUploadStatus should be true', function () {
      AACommonService.setMediaUploadStatus(true);
      expect(AACommonService.isFormDirty()).toBeTruthy();
    });
    it('getUniqueId should be incremented', function () {
      AACommonService.getUniqueId();
      var id2 = AACommonService.getUniqueId();
      expect(id2).toEqual(2);
    });
    it('all is valid by default', function () {
      expect(AACommonService.isValid()).toBeTruthy();
    });

    it('is valid or invalid as set with one item', function () {
      AACommonService.setIsValid('1', false);
      expect(AACommonService.isValid()).toBeFalsy();
      expect(AACommonService.getInvalid('1')).toBeFalsy();

      AACommonService.setIsValid('1', true);
      expect(AACommonService.isValid()).toBeTruthy();
      expect(AACommonService.getInvalid('1')).not.toBeDefined();
    });

    it('is making properly formatted key', function () {
      var k = AACommonService.makeKey('openHours', 'someTag');

      expect(k).toEqual('openHours' + '-' + 'someTag');
    });

    it('is valid or invalid as set for multiple items', function () {
      AACommonService.setIsValid('1', false);
      expect(AACommonService.isValid()).toBeFalsy();

      AACommonService.setIsValid('1', true);
      expect(AACommonService.isValid()).toBeTruthy();

      AACommonService.setIsValid('1', false);
      AACommonService.setIsValid('2', false);
      expect(AACommonService.isValid()).toBeFalsy();

      AACommonService.setIsValid('1', true);
      expect(AACommonService.isValid()).toBeFalsy();

      AACommonService.setIsValid('2', true);
      expect(AACommonService.isValid()).toBeTruthy();
    });
    it('setMultiSiteEnabledToggle should set to false', function () {
      AACommonService.setMultiSiteEnabledToggle(false);
      expect(AACommonService.isMultiSiteEnabled()).toBeFalsy();
    });
    it('setMultiSiteEnabledToggle should set to true', function () {
      AACommonService.setMultiSiteEnabledToggle(true);
      expect(AACommonService.isMultiSiteEnabled()).toBeTruthy();
    });
    it('setRouteSIPAddressToggle should set to false', function () {
      AACommonService.setRouteSIPAddressToggle(false);
      expect(AACommonService.isRouteSIPAddressToggle()).toBeFalsy();
    });
    it('setRouteSIPAddressToggle should set to true', function () {
      AACommonService.setRouteSIPAddressToggle(true);
      expect(AACommonService.isRouteSIPAddressToggle()).toBeTruthy();
    });
    it('setMediaUploadToggle should set to false', function () {
      AACommonService.setMediaUploadToggle(false);
      expect(AACommonService.isMediaUploadToggle()).toBeFalsy();
    });
    it('setMediaUploadToggle should set to true', function () {
      AACommonService.setMediaUploadToggle(true);
      expect(AACommonService.isMediaUploadToggle()).toBeTruthy();
    });

    it('setCallerInputStatus should set to true', function () {
      AACommonService.setCallerInputStatus(true);
      expect(AACommonService.isFormDirty()).toBeTruthy();
    });
    it('setCallerInputStatus should set to false', function () {
      AACommonService.setCallerInputStatus(false);
      expect(AACommonService.isFormDirty()).toBeFalsy();
    });

    it('setQueueSettingsStatus should set to true', function () {
      AACommonService.setQueueSettingsStatus(true);
      expect(AACommonService.isFormDirty()).toBeTruthy();
    });
    it('setQueueSettingsStatus should set to false', function () {
      AACommonService.setQueueSettingsStatus(false);
      expect(AACommonService.isFormDirty()).toBeFalsy();
    });
    it('setRestApiTogglePhase2 should set to false', function () {
      AACommonService.setRestApiTogglePhase2(false);
      expect(AACommonService.isRestApiTogglePhase2()).toBeFalsy();
    });
    it('setRestApiTogglePhase2 should set to true', function () {
      AACommonService.setRestApiTogglePhase2(true);
      expect(AACommonService.isRestApiTogglePhase2()).toBeTruthy();
    });
    it('setHybridToggle should set to true', function () {
      AACommonService.setHybridToggle(true);
      expect(AACommonService.isHybridEnabledOnOrg()).toBeTruthy();
    });
    it('setHybridToggle should set to false', function () {
      AACommonService.setHybridToggle(false);
      expect(AACommonService.isHybridEnabledOnOrg()).toBeFalsy();
    });
  });

  describe('saveUiModel', function () {
    beforeEach(function () {
      spyOn(AutoAttendantCeMenuModelService, 'updateCombinedMenu');
      spyOn(AutoAttendantCeMenuModelService, 'deleteCombinedMenu');
      spyOn(AutoAttendantCeMenuModelService, 'newCeMenu').and.callThrough();
      spyOn(AutoAttendantCeMenuModelService, 'getCombinedMenu').and.callThrough();
    });

    it('should write openHours menu into model', function () {
      ui.isOpenHours = true;
      ui.isClosedHours = false;
      ui.isHolidays = false;

      AACommonService.saveUiModel(ui, aaRecord);
      expect(AutoAttendantCeMenuModelService.updateCombinedMenu).toHaveBeenCalled();
    });

    it('should write closedHours menu into model', function () {
      ui.isOpenHours = false;
      ui.isClosedHours = true;
      ui.isHolidays = false;

      AACommonService.saveUiModel(ui, aaRecord);
      expect(AutoAttendantCeMenuModelService.updateCombinedMenu).toHaveBeenCalled();
    });

    it('should write holidays menu into model', function () {
      ui.isOpenHours = true;
      ui.isClosedHours = true;
      ui.isHolidays = true;
      ui.holidaysValue = 'closedHours';

      AACommonService.saveUiModel(ui, aaRecord);
      expect(AutoAttendantCeMenuModelService.updateCombinedMenu).toHaveBeenCalled();
    });
  });

  describe('sortByProperty', function () {
    it('sort by title', function () {
      unSortedOptions.sort(AACommonService.sortByProperty('title'));
      for (var i = 0; i < sortedOptions.length; i++) {
        expect(unSortedOptions[i].title).toEqual(sortedOptions[i].title);
      }
    });

    it('sort by label', function () {
      unSortedOptions.sort(AACommonService.sortByProperty('label'));
      for (var i = 0; i < sortedOptions.length; i++) {
        expect(unSortedOptions[i].label).toEqual(sortedOptions[i].label);
      }
    });
  });

  describe('collectThisCeActionValue', function () {
    it('should find the variable from runActionsOnInput (callerInput)', function () {
      var aaUiModel = {};
      aaUiModel.openHours = AutoAttendantCeMenuModelService.newCeMenu();

      aaUiModel['openHours'].addEntryAt(0, AutoAttendantCeMenuModelService.newCeMenuEntry());

      var action = AutoAttendantCeMenuModelService.newCeActionEntry('runActionsOnInput', '');
      action.inputType = 2;
      action.variableName = 'My variable name';

      aaUiModel['openHours'].entries[0].addAction(action);

      var result = AACommonService.collectThisCeActionValue(aaUiModel, true, false);
      expect(result[0]).toEqual('My variable name');
    });

    it('should find the variable from conditional (decision)', function () {
      var aaUiModel = {};
      aaUiModel.openHours = AutoAttendantCeMenuModelService.newCeMenu();

      aaUiModel['openHours'].addEntryAt(0, AutoAttendantCeMenuModelService.newCeMenuEntry());

      var action = AutoAttendantCeMenuModelService.newCeActionEntry('conditional', '');
      action.if = { leftCondition: 'My variable name' };

      aaUiModel['openHours'].entries[0].addAction(action);

      var result = AACommonService.collectThisCeActionValue(aaUiModel, false, true);
      expect(result[0]).toEqual('My variable name');
    });
    it('should not find the variable from conditional (decision)', function () {
      var aaUiModel = {};
      aaUiModel.openHours = AutoAttendantCeMenuModelService.newCeMenu();

      aaUiModel['openHours'].addEntryAt(0, AutoAttendantCeMenuModelService.newCeMenuEntry());

      var action = AutoAttendantCeMenuModelService.newCeActionEntry('some action name', '');

      aaUiModel['openHours'].entries[0].addAction(action);

      var result = AACommonService.collectThisCeActionValue(aaUiModel, true, false);
      expect(result.length).toEqual(0);
    });
  });
  it('should return list of doRest', function () {
    var aaUiModel = {};

    aaUiModel.openHours = AutoAttendantCeMenuModelService.newCeMenu();
    aaUiModel.closedHours = AutoAttendantCeMenuModelService.newCeMenu();

    var menuOpen = AutoAttendantCeMenuModelService.newCeMenuEntry();
    var menuClosed = AutoAttendantCeMenuModelService.newCeMenuEntry();
    aaUiModel['openHours'].addEntryAt(0, menuOpen);
    aaUiModel['closedHours'].addEntryAt(0, menuClosed);

    var action = AutoAttendantCeMenuModelService.newCeActionEntry('doREST', '');
    action.variableName = 'Closed Variable';
    menuClosed.addAction(action);

    var action2 = AutoAttendantCeMenuModelService.newCeActionEntry('doREST', '');
    action2.variableName = 'Open Variable';
    menuOpen.addAction(action2);

    var res = AACommonService.collectThisCeActionValue(aaUiModel, true);
    // verify data returned
    expect(res).toBeDefined(2);
  });

  describe('keyActionAvailable', function () {
    it('should send back available keys minus 0, 1', function () {
      var expected = ['2', '3', '4', '5', '6', '7', '8', '9', '#', '*'];

      var inputActions = [{
        key: '0',
      }, {
        key: '1',
      }];

      var available = AACommonService.keyActionAvailable('', inputActions);

      expect(available.length).toEqual(10);
      expect(available).toEqual(expected);
    });

    it('should send back available keys minus 0, 1 but with 9', function () {
      var inputActions = [{
        key: '0',
      }, {
        key: '1',
      }, {
        key: '9',
      }];

      var available = AACommonService.keyActionAvailable('9', inputActions);

      expect(available.length).toEqual(10);
    });

    it('should send back available keys minus 0, 1 with 5', function () {
      var expected = ['2', '3', '4', '5', '6', '7', '8', '#', '*'];

      var inputActions = [{
        key: '0',
      }, {
        key: '1',
      }, {
        key: '9',
      }];

      var available = AACommonService.keyActionAvailable('5', inputActions);

      expect(available.length).toEqual(9);
      expect(available).toEqual(expected);
    });
  });
});
