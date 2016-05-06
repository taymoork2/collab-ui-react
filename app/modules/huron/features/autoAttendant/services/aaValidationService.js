(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .factory('AAValidationService', AAValidationService);

  /* @ngInject */
  function AAValidationService(AAModelService, AutoAttendantCeInfoModelService, AANotificationService, $translate) {

    var service = {
      isNameValidationSuccess: isNameValidationSuccess,
      isPhoneMenuValidationSuccess: isPhoneMenuValidationSuccess
    };

    return service;

    /////////////////////

    function isNameValidationSuccess(name, uuid) {
      var aaModel = AAModelService.getAAModel();

      if (!angular.isDefined(name) || name.trim().length === 0) {
        AANotificationService.error('autoAttendant.invalidBuilderNameMissing');
        return false;
      }

      if (!angular.isDefined(uuid)) {
        return false;
      }

      for (var i = 0; i < aaModel.ceInfos.length; i++) {
        if ((uuid !== AutoAttendantCeInfoModelService.extractUUID(aaModel.ceInfos[i].ceUrl)) && (name === aaModel.ceInfos[i].getName())) {
          AANotificationService.error('autoAttendant.invalidBuilderNameNotUnique');
          return false;
        }
      }

      return true;
    }

    function checkAllKeys(optionMenu) {
      var outErrors = [];
      var entry = _.forEach(optionMenu.entries, function (entry) {
        if (entry.key && 'goto' === entry.actions[0].name && !entry.actions[0].value) {
          outErrors.push({
            msg: 'autoAttendant.phoneMenuErrorRouteToAATargetMissing',
            key: entry.key
          });
        }
        if (entry.key && 'routeToHuntGroup' === entry.actions[0].name && !entry.actions[0].value) {
          outErrors.push({
            msg: 'autoAttendant.phoneMenuErrorRouteToHGTargetMissing',
            key: entry.key
          });
        }
        if (entry.key && 'routeToUser' === entry.actions[0].name && !entry.actions[0].value) {
          outErrors.push({
            msg: 'autoAttendant.phoneMenuErrorRouteToUserTargetMissing',
            key: entry.key
          });
        }
        if (entry.key && 'routeToVoiceMail' === entry.actions[0].name && !entry.actions[0].value) {
          outErrors.push({
            msg: 'autoAttendant.phoneMenuErrorRouteToVoicemailTargetMissing',
            key: entry.key
          });
        }
        if (entry.key && 'route' === entry.actions[0].name && !entry.actions[0].value) {
          outErrors.push({
            msg: 'autoAttendant.phoneMenuErrorRouteToPhoneNumberTargetMissing',
            key: entry.key
          });
        }
      });

      return outErrors;

    }

    function isPhoneMenuValidationSuccess(ui) {
      var openHoursValid = true;
      var closedHoursValid = true;
      var holidaysValid = true;

      var closedHoursLabel = $translate.instant('autoAttendant.scheduleClosed');
      var holidayHoursLabel = $translate.instant('autoAttendant.scheduleHolidays');
      var openHoursLabel = $translate.instant('autoAttendant.scheduleOpen');
      var closedHolidayHoursLabel = $translate.instant('autoAttendant.scheduleClosedHolidays');

      /* check holiday value to determine if holiday uses open closed or holiday lane */

      var closedHoliday =  _.get(ui, 'holidaysValue') === 'closedHours';
      if (ui.isOpenHours && _.has(ui, 'openHours.entries')) {
        openHoursValid = checkForValid(ui.openHours, openHoursLabel);
      }
      if (ui.isClosedHours && _.has(ui, 'closedHours.entries')) {
        closedHoursValid = checkForValid(ui.closedHours, 
          closedHoliday ? closedHolidayHoursLabel : closedHoursLabel);
      }

      /* if holiday follows closed behavior, then don't validate */
      if (ui.isHolidays && (!closedHoliday) && _.has(ui, 'holidays.entries')) {
        holidaysValid = checkForValid(ui.holidays, holidayHoursLabel);
      }

      return openHoursValid && closedHoursValid && holidaysValid;

    }

    function checkForValid(uiCombinedMenu, fromLane) {
      var isValid = true;
      var errors = [];

      var menuOptions = _.filter(uiCombinedMenu.entries, {
        'type': 'MENU_OPTION'
      });

      _.forEach(menuOptions, function (optionMenu) {

        if (_.has(optionMenu, 'entries')) {
          errors = checkAllKeys(optionMenu);
        }

        _.forEach(errors, function (err) {
          isValid = false;
          AANotificationService.error(err.msg, {
            key: err.key,
            schedule: fromLane,
            at : _.indexOf(menuOptions, optionMenu) + 1
          });
        });
      });

      return isValid;

    }
  }
})();
