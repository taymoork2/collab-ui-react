  'use strict';

  describe('Service:AACommonService', function () {

    var AACommonService, AutoAttendantCeMenuModelService;

    var ui = {};
    var aaRecord = {};

    var sortedOptions = [{
      "title": 'autoAttendant.actionPhoneMenu',
      "label": 'AutoAttendantTestLabel'
    }, {
      "title": 'autoAttendant.actionRouteCall',
      "label": 'autoAttendantTestLabel'
    }, {
      "title": 'autoAttendant.actionSayMessage',
      "label": 'secondTestLabel'
    }, {
      "title": 'autoAttendant.phoneMenuDialExt',
      "label": 'testLabel'
    }];

    var unSortedOptions = [{
      "title": 'autoAttendant.actionRouteCall',
      "label": 'testLabel'
    }, {
      "title": 'autoAttendant.phoneMenuDialExt',
      "label": 'autoAttendantTestLabel'
    }, {
      "title": 'autoAttendant.actionSayMessage',
      "label": 'AutoAttendantTestLabel'
    }, {
      "title": 'autoAttendant.actionPhoneMenu',
      "label": 'secondTestLabel'
    }];

    beforeEach(angular.mock.module('uc.autoattendant'));
    beforeEach(angular.mock.module('Huron'));
    beforeEach(inject(function (_AACommonService_, _AutoAttendantCeMenuModelService_) {
      AACommonService = _AACommonService_;
      AutoAttendantCeMenuModelService = _AutoAttendantCeMenuModelService_;
    }));

    afterEach(function () {

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
        AACommonService.setIsValid("1", false);
        expect(AACommonService.isValid()).toBeFalsy();
        expect(AACommonService.getInvalid("1")).toBeFalsy();

        AACommonService.setIsValid("1", true);
        expect(AACommonService.isValid()).toBeTruthy();
        expect(AACommonService.getInvalid("1")).not.toBeDefined();

      });

      it('is making properly formatted key', function () {

        var k = AACommonService.makeKey('openHours', 'someTag');

        expect(k).toEqual('openHours' + '-' + 'someTag');

      });

      it('is valid or invalid as set for multiple items', function () {
        AACommonService.setIsValid("1", false);
        expect(AACommonService.isValid()).toBeFalsy();

        AACommonService.setIsValid("1", true);
        expect(AACommonService.isValid()).toBeTruthy();

        AACommonService.setIsValid("1", false);
        AACommonService.setIsValid("2", false);
        expect(AACommonService.isValid()).toBeFalsy();

        AACommonService.setIsValid("1", true);
        expect(AACommonService.isValid()).toBeFalsy();

        AACommonService.setIsValid("2", true);
        expect(AACommonService.isValid()).toBeTruthy();

      });

      it('setRouteQueueToggle should set to false', function () {
        AACommonService.setRouteQueueToggle(false);
        expect(AACommonService.isRouteQueueToggle()).toBeFalsy();
      });

      it('setRouteQueueToggle should set to true', function () {
        AACommonService.setRouteQueueToggle(true);
        expect(AACommonService.isRouteQueueToggle()).toBeTruthy();
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

  });
