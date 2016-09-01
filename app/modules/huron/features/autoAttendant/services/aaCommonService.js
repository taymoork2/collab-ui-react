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
    var aaMediaUploadStatus = false;
    var routeQueueToggle = false;
    var mediaUploadToggle = false;

    var invalidList = {};
    var service = {
      isFormDirty: isFormDirty,
      setSayMessageStatus: setSayMessageStatus,
      setPhoneMenuStatus: setPhoneMenuStatus,
      setActionStatus: setActionStatus,
      setDialByExtensionStatus: setDialByExtensionStatus,
      setCENumberStatus: setCENumberStatus,
      setMediaUploadStatus: setMediaUploadStatus,
      setRouteQueueToggle: setRouteQueueToggle,
      isRouteQueueToggle: isRouteQueueToggle,
      setMediaUploadToggle: setMediaUploadToggle,
      isMediaUploadToggle: isMediaUploadToggle,
      isValid: isValid,
      setIsValid: setIsValid,
      getInvalid: getInvalid,
      makeKey: makeKey,
      resetFormStatus: resetFormStatus,
      saveUiModel: saveUiModel,
      sortByProperty: sortByProperty
    };

    return service;

    /////////////////////

    function isFormDirty() {
      return aaMediaUploadStatus || aaSayMessageForm || aaPhoneMenuOptions || aaActionStatus || aaDialByExtensionStatus || aaCENumberStatus;
    }

    function isValid() {
      return !_.size(invalidList);
    }

    function getInvalid(which) {
      return invalidList[which];
    }

    function makeKey(schedule, tag) {
      /* Used by aaVerificationSuccess and aaRouteToExtNum */
      /* this is an attempt to (weakly) codify the keys used by getInvalid */

      return schedule + '-' + tag;
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
      aaMediaUploadStatus = false;
      aaCENumberStatus = false;
      routeQueueToggle = false;
      invalidList = {};
    }

    function setMediaUploadStatus(status) {
      aaMediaUploadStatus = status;
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

    function setRouteQueueToggle(status) {
      routeQueueToggle = status;
    }

    function setMediaUploadToggle(status) {
      mediaUploadToggle = status;
    }

    /**
     * Will check the toggle status for Queue which is set while aaPhoneMenuCtrl
     */
    function isRouteQueueToggle() {
      return routeQueueToggle;
    }

    /**
    * will check the toggle status for queue which is only allowed for say messages and not phone menu or submenu
    */
    function isMediaUploadToggle() {
      return mediaUploadToggle;
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

      if (ui.isClosedHours || (ui.holidaysValue === 'closedHours' && ui.isHolidays)) {
        if (angular.isUndefined(closedHours)) { //New
          closedHours = AutoAttendantCeMenuModelService.newCeMenu();
          closedHours.setType('MENU_WELCOME');
        }
        AutoAttendantCeMenuModelService.updateCombinedMenu(aaRecord, 'closedHours', closedHours);
      } else {
        AutoAttendantCeMenuModelService.deleteScheduleActionSetMap(aaRecord, 'closedHours');
      }

      if (ui.isHolidays && ui.holidaysValue !== 'closedHours') {
        if (angular.isUndefined(holidays)) { //New
          holidays = AutoAttendantCeMenuModelService.newCeMenu();
          holidays.setType('MENU_WELCOME');
        }
        AutoAttendantCeMenuModelService.updateCombinedMenu(aaRecord, 'holidays', holidays, ui.holidaysValue);
      } else if (ui.isHolidays) {
        AutoAttendantCeMenuModelService.updateScheduleActionSetMap(aaRecord, 'holidays', ui.holidaysValue);
      } else {
        AutoAttendantCeMenuModelService.deleteScheduleActionSetMap(aaRecord, 'holidays', ui.holidaysValue);
      }

      AutoAttendantCeMenuModelService.updateDefaultActionSet(aaRecord, ui.hasClosedHours);
    }

  }

  /**
   * This will sort the string array based on the property passed.
   */
  var sortByProperty = function (property) {
    return function (a, b) {
      return a[property].toLocaleUpperCase().localeCompare(b[property].toLocaleUpperCase());
    };
  };

})();
