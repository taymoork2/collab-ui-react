(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .factory('AACommonService', AACommonService);

  function AACommonService(AutoAttendantCeMenuModelService) {

    var aaSayMessageForm = false;
    var aaPhoneMenuOptions = false;
    var aaActionStatus = false;
    var aaDialByExtensionStatus = false;
    var aaCENumberStatus = false;

    var invalidList = {};
    var service = {
      isFormDirty: isFormDirty,
      setSayMessageStatus: setSayMessageStatus,
      setPhoneMenuStatus: setPhoneMenuStatus,
      setActionStatus: setActionStatus,
      setDialByExtensionStatus: setDialByExtensionStatus,
      setCENumberStatus: setCENumberStatus,
      isValid: isValid,
      setIsValid: setIsValid,
      resetFormStatus: resetFormStatus,
      saveUiModel: saveUiModel
    };

    return service;

    /////////////////////

    function isFormDirty() {
      return aaSayMessageForm || aaPhoneMenuOptions || aaActionStatus || aaDialByExtensionStatus || aaCENumberStatus;
    }

    function isValid() {
      return !_.size(invalidList);
    }

    function setIsValid(element, validity) {
      if (!validity) {
        invalidList[element] = validity;
      } else {
        delete invalidList[element];
      }
    }

    function resetFormStatus() {
      aaSayMessageForm = false;
      aaPhoneMenuOptions = false;
      aaActionStatus = false;
      aaDialByExtensionStatus = false;
      aaCENumberStatus = false;
      invalidList = {};
    }

    function setSayMessageStatus(status) {
      aaSayMessageForm = status;
    }

    function setPhoneMenuStatus(status) {
      aaPhoneMenuOptions = status;
    }

    function setActionStatus(status) {
      aaActionStatus = status;
    }

    function setDialByExtensionStatus(status) {
      aaDialByExtensionStatus = status;
    }

    function setCENumberStatus(status) {
      aaCENumberStatus = status;
    }

    function saveUiModel(ui, aaRecord) {
      var openHours = AutoAttendantCeMenuModelService.getCombinedMenu(aaRecord, 'openHours');
      var closedHours = AutoAttendantCeMenuModelService.getCombinedMenu(aaRecord, 'closedHours');
      var holidays = AutoAttendantCeMenuModelService.getCombinedMenu(aaRecord, 'holidays');
      if (ui.isOpenHours) {
        if (angular.isUndefined(openHours)) {
          openHours = AutoAttendantCeMenuModelService.newCeMenu();
          openHours.setType('MENU_WELCOME');
        }
        AutoAttendantCeMenuModelService.updateCombinedMenu(aaRecord, 'openHours', openHours);
      }

      if (ui.isClosedHours) {
        if (angular.isUndefined(closedHours)) { //New
          closedHours = AutoAttendantCeMenuModelService.newCeMenu();
          closedHours.setType('MENU_WELCOME');
        }
        AutoAttendantCeMenuModelService.updateCombinedMenu(aaRecord, 'closedHours', closedHours);
      } else if (angular.isDefined(closedHours)) { //Delete
        AutoAttendantCeMenuModelService.deleteCombinedMenu(aaRecord, 'closedHours');
      }

      if (ui.isHolidays) {
        if (angular.isUndefined(holidays)) { //New
          holidays = AutoAttendantCeMenuModelService.newCeMenu();
          holidays.setType('MENU_WELCOME');
        }
        AutoAttendantCeMenuModelService.updateCombinedMenu(aaRecord, 'holidays', holidays);

      } else if (angular.isDefined(holidays)) { //delete
        AutoAttendantCeMenuModelService.deleteCombinedMenu(aaRecord, 'holidays');
      }
    }

  }
})();
