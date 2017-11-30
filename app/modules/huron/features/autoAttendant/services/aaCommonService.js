(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .factory('AACommonService', AACommonService);

  function AACommonService($translate, AutoAttendantCeMenuModelService) {
    var aaSayMessageForm = false;
    var aaPhoneMenuOptions = false;
    var aaCallerInputStatus = false;
    var aaDecisionStatus = false;
    var aaActionStatus = false;
    var aaDialByExtensionStatus = false;
    var aaCENumberStatus = false;
    var aaMediaUploadStatus = false;
    var aaQueueSettingsStatus = false;
    var mediaUploadToggle = false;
    var routeSIPAddressToggle = false;
    var dynAnnounceToggle = false;
    var returnedCallerToggle = false;
    var multiSiteToggle = false;
    var uniqueId = 0;
    var restApiToggle = false;
    var aaRestApiStatus = false;
    var restApiTogglePhase2 = false;

    var invalidList = {};
    var schedules = ['openHours', 'closedHours', 'Holidays'];

    var varOptions = {
      'Original-Called-Number': $translate.instant('autoAttendant.decisionNumberDialed'),
      'Original-Caller-Number': $translate.instant('autoAttendant.decisionCallerNumber'),
      'Original-Remote-Party-ID': $translate.instant('autoAttendant.decisionCallerName'),
      'Original-Caller-Country-Code': $translate.instant('autoAttendant.decisionCallerCountryCode'),
      'Original-Caller-Area-Code': $translate.instant('autoAttendant.decisionCallerAreaCode'),
    };

    /* We have intentionally added the blank space in the following list.
     * Because isDynamic flag gets true in case of BR or new lines
     * and we are using this list to not show warning in case of pre-populated
     * variables and BR or new lines in a say message.*/

    var prePopulatedSessionVariablesList = ['Original-Called-Number',
      'Original-Caller-Number',
      'Original-Remote-Party-ID',
      'Original-Caller-Country-Code',
      'Original-Caller-Area-Code',
      ''];

    var service = {
      isFormDirty: isFormDirty,
      setSayMessageStatus: setSayMessageStatus,
      setPhoneMenuStatus: setPhoneMenuStatus,
      setCallerInputStatus: setCallerInputStatus,
      setDecisionStatus: setDecisionStatus,
      setActionStatus: setActionStatus,
      setRestApiStatus: setRestApiStatus,
      setDialByExtensionStatus: setDialByExtensionStatus,
      setCENumberStatus: setCENumberStatus,
      setMediaUploadStatus: setMediaUploadStatus,
      setQueueSettingsStatus: setQueueSettingsStatus,
      setMediaUploadToggle: setMediaUploadToggle,
      setRouteSIPAddressToggle: setRouteSIPAddressToggle,
      setRestApiToggle: setRestApiToggle,
      isRestApiToggle: isRestApiToggle,
      setDynAnnounceToggle: setDynAnnounceToggle,
      setReturnedCallerToggle: setReturnedCallerToggle,
      setMultiSiteEnabledToggle: setMultiSiteEnabledToggle,
      isMultiSiteEnabled: isMultiSiteEnabled,
      setRestApiTogglePhase2: setRestApiTogglePhase2,
      isRestApiTogglePhase2: isRestApiTogglePhase2,
      isDynAnnounceToggle: isDynAnnounceToggle,
      isMediaUploadToggle: isMediaUploadToggle,
      isRouteSIPAddressToggle: isRouteSIPAddressToggle,
      isReturnedCallerToggle: isReturnedCallerToggle,
      collectThisCeActionValue: collectThisCeActionValue,
      isValid: isValid,
      setIsValid: setIsValid,
      getInvalid: getInvalid,
      getUniqueId: getUniqueId,
      makeKey: makeKey,
      resetFormStatus: resetFormStatus,
      saveUiModel: saveUiModel,
      sortByProperty: sortByProperty,
      keyActionAvailable: keyActionAvailable,
      DIGITS_DIAL_BY: 2,
      DIGITS_RAW: 3,
      DIGITS_CHOICE: 4,
      getprePopulatedSessionVariablesList: getprePopulatedSessionVariablesList,
      getVarOption: getVarOption,
    };

    return service;

    /////////////////////

    function getprePopulatedSessionVariablesList() {
      return prePopulatedSessionVariablesList;
    }

    function getVarOption(value) {
      return varOptions[value];
    }

    function isFormDirty() {
      return aaQueueSettingsStatus || aaRestApiStatus || aaMediaUploadStatus || aaSayMessageForm || aaPhoneMenuOptions || aaCallerInputStatus || aaActionStatus || aaDialByExtensionStatus || aaCENumberStatus || aaDecisionStatus;
    }

    function isValid() {
      return (_.size(invalidList) === 0);
    }

    function getInvalid(which) {
      return invalidList[which];
    }

    function makeKey(schedule, tag) {
      /* Used by aaVerificationSuccess and aaRouteToExtNum */
      /* this is an attempt to (weakly) codify the keys used by getInvalid */

      return schedule + '-' + tag;
    }

    function getUniqueId() {
      return ++uniqueId;
    }

    function setIsValid(element, validity) {
      if (!validity) {
        invalidList[element] = validity;
      } else {
        delete invalidList[element];
      }
    }
    function setMediaUploadStatus(status) {
      aaMediaUploadStatus = status;
    }

    function resetFormStatus() {
      aaSayMessageForm = false;
      aaRestApiStatus = false;
      aaPhoneMenuOptions = false;
      aaCallerInputStatus = false;
      aaDecisionStatus = false;
      aaActionStatus = false;
      aaDialByExtensionStatus = false;
      aaMediaUploadStatus = false;
      aaQueueSettingsStatus = false;
      aaCENumberStatus = false;
      invalidList = {};
    }

    function setSayMessageStatus(status) {
      aaSayMessageForm = status;
    }

    function setRestApiStatus(status) {
      aaRestApiStatus = status;
    }

    function setPhoneMenuStatus(status) {
      aaPhoneMenuOptions = status;
    }
    function setCallerInputStatus(status) {
      aaCallerInputStatus = status;
    }
    function setDecisionStatus(status) {
      aaDecisionStatus = status;
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

    function setDynAnnounceToggle(status) {
      dynAnnounceToggle = status;
    }
    function setQueueSettingsStatus(status) {
      aaQueueSettingsStatus = status;
    }

    function setMediaUploadToggle(status) {
      mediaUploadToggle = status;
    }

    function setRouteSIPAddressToggle(status) {
      routeSIPAddressToggle = status;
    }

    function setReturnedCallerToggle(status) {
      returnedCallerToggle = status;
    }
    function setMultiSiteEnabledToggle(status) {
      multiSiteToggle = status;
    }
    function isMultiSiteEnabled() {
      return multiSiteToggle;
    }

    function isReturnedCallerToggle() {
      return returnedCallerToggle;
    }

    function setRestApiToggle(status) {
      restApiToggle = status;
    }

    function setRestApiTogglePhase2(status) {
      restApiTogglePhase2 = status;
    }

    function isRestApiTogglePhase2() {
      return restApiTogglePhase2;
    }

    function isDynAnnounceToggle() {
      return dynAnnounceToggle;
    }

    function isRestApiToggle() {
      return restApiToggle;
    }

    function isMediaUploadToggle() {
      return mediaUploadToggle;
    }

    function isRouteSIPAddressToggle() {
      return routeSIPAddressToggle;
    }

    function saveUiModel(ui, aaRecord) {
      var openHours = AutoAttendantCeMenuModelService.getCombinedMenu(aaRecord, 'openHours');
      var closedHours = AutoAttendantCeMenuModelService.getCombinedMenu(aaRecord, 'closedHours');
      var holidays = AutoAttendantCeMenuModelService.getCombinedMenu(aaRecord, 'holidays');
      if (ui.isOpenHours) {
        if (_.isUndefined(openHours)) {
          openHours = AutoAttendantCeMenuModelService.newCeMenu();
          openHours.setType('MENU_WELCOME');
        }
        AutoAttendantCeMenuModelService.updateCombinedMenu(aaRecord, 'openHours', openHours);
      }

      if (ui.isClosedHours || (ui.holidaysValue === 'closedHours' && ui.isHolidays)) {
        if (_.isUndefined(closedHours)) { //New
          closedHours = AutoAttendantCeMenuModelService.newCeMenu();
          closedHours.setType('MENU_WELCOME');
        }
        AutoAttendantCeMenuModelService.updateCombinedMenu(aaRecord, 'closedHours', closedHours);
      } else {
        AutoAttendantCeMenuModelService.deleteScheduleActionSetMap(aaRecord, 'closedHours');
      }

      if (ui.isHolidays && ui.holidaysValue !== 'closedHours') {
        if (_.isUndefined(holidays)) { //New
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
    function collectActionValue(entry, varNames, isFindSessionVar, isFindConditionals) {
      _.forEach(entry, function (value, key) {
        if (_.isArray(value)) {
          _.forEach(value, function (nowEntry) {
            return collectActionValue(nowEntry, varNames, isFindSessionVar, isFindConditionals);
          });
        }

        if (isFindSessionVar && key === 'variableName') {
          if (_.has(entry, 'newVariableValue')) {
            if (!_.isEmpty(entry.newVariableValue)) {
              varNames.push(entry.newVariableValue);
            }
          } else {
            if (!_.isEmpty(value)) {
              varNames.push(value);
            }
          }
        }
        if (isFindConditionals && key === 'if') {
          if (!_.isEmpty(value)) {
            varNames.push(_.get(value, 'leftCondition', ''));
          }
        }

        if (AutoAttendantCeMenuModelService.isCeMenuEntry(value)) {
          return collectActionValue(value, varNames, isFindSessionVar, isFindConditionals);
        }
      });
      return varNames;
    }
    function collectThisCeActionValue(ui, isFindSessionVar, isFindConditionals) {
      var varNames = [];
      // collect all Var names used in the Ce except for this screen

      _.forEach(schedules, function (schedule) {
        varNames = collectActionValue(ui[schedule], varNames, isFindSessionVar, isFindConditionals);
      });

      return varNames;
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

  /*
   * will cycle through key actions and extract already used keys.
   * return: a set of available keys
   */
  function keyActionAvailable(selectedKey, inputActions) {
    var keys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '#', '*'];

    _.forEach(inputActions, function (inputAction) {
      if (inputAction.key !== selectedKey) {
        _.pull(keys, inputAction.key);
      }
    });

    return keys;
  }
})();
