(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .factory('AAValidationService', AAValidationService);

  /* @ngInject */
  function AAValidationService(AAModelService, AutoAttendantCeInfoModelService, AANotificationService, AACommonService, $translate) {

    var routeToCalls = [{
      'name': 'goto',
      errRCMsg: 'autoAttendant.routeCallErrorRouteToAATargetMissing',
      errPhoneMsg: 'autoAttendant.phoneMenuErrorRouteToAATargetMissing'
    }, {
      name: 'routeToHuntGroup',
      errRCMsg: 'autoAttendant.routeCallErrorRouteToHGTargetMissing',
      errPhoneMsg: 'autoAttendant.phoneMenuErrorRouteToHGTargetMissing'
    }, {
      name: 'routeToUser',
      errRCMsg: 'autoAttendant.routeCallErrorRouteToUserTargetMissing',
      errPhoneMsg: 'autoAttendant.phoneMenuErrorRouteToUserTargetMissing'
    }, {
      name: 'routeToVoiceMail',
      errRCMsg: 'autoAttendant.routeCallErrorRouteToVoicemailTargetMissing',
      errPhoneMsg: 'autoAttendant.phoneMenuErrorRouteToVoicemailTargetMissing'
    }, {
      name: 'route',
      errRCMsg: 'autoAttendant.routeCallErrorRouteToPhoneNumberTargetMissing',
      errPhoneMsg: 'autoAttendant.phoneMenuErrorRouteToPhoneNumberTargetMissing'
    }, {
      name: 'routeToQueue',
      /* not implemented */
      errRCMsg: '',
      errPhoneMsg: 'autoAttendant.phoneMenuErrorRouteToQueueTargetMissing'
    }];

    var service = {
      isNameValidationSuccess: isNameValidationSuccess,
      isRouteToValidationSuccess: isRouteToValidationSuccess
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

    function actionValid(entry, whichLane, whichMenu, tag, type) {
      var action;

      if (type === 'MENU_OPTION' && _.isEmpty(entry.key)) {
        /* entry was a phone menu with no selected entry for the key, ignore */
        return true;
      }

      if (_.isEmpty(entry.actions[0])) {
        /* no actions to validate */
        return true;
      }

      action = entry.actions[0];

      // special case - when action is route we need to check for valid phone number
      if (action.name === 'route') {
        /* AACommonService maintains a list which looks like: 
           holiday-2-0 for phoneMenu 
           holiday-1-RouteCalls for route call
        */

        var ret = AACommonService.getInvalid(AACommonService.makeKey(whichLane, whichMenu, tag));
        /* getInvalid returns false if an error, undefined if no error */
        return angular.isUndefined(ret);

      }

      /* checking entry for blank value. Not empty? auto passes */
      if (!_.isEmpty(action.value)) {
        return true;
      }

      return false;

    }

    /* whichMenu - index into the original array..position in the lane of this screen
       whichLane - openHours, closeHours, holiday
     */
    function checkAllActions(optionMenu, whichMenu, whichLane) {
      var m;

      if (actionValid(optionMenu, whichLane, whichMenu, 'RouteCall', optionMenu.type)) {
        return;
      }

      /* got here? error */

      m = _.find(routeToCalls, {
        name: optionMenu.actions[0].name
      });

      /* might be Say Message, not in the routeCalls list */
      if (m) {
        return m.errRCMsg;
      }

      return;
    }

    /* whichMenu - index into the original array..position in the lane of this screen
       whichLane - openHours, closeHours, holiday
     */
    function checkAllKeys(optionMenu, whichMenu, whichLane) {
      var outErrors = [];

      _.forEach(optionMenu.entries, function (entry, index) {

        if (actionValid(entry, whichLane, whichMenu, index, optionMenu.type)) {
          return;
        }

        /* got here? error */

        _.find(routeToCalls, function (routeTo) {
          if (routeTo.name === entry.actions[0].name) {
            outErrors.push({
              msg: routeTo.errPhoneMsg,
              key: entry.key
            });

            return true;

          }

        });

      });

      return outErrors;

    }

    function isRouteToValidationSuccess(ui) {
      var openHoursValid = true;
      var closedHoursValid = true;
      var holidaysValid = true;

      var closedHoursLabel = $translate.instant('autoAttendant.scheduleClosed');
      var holidayHoursLabel = $translate.instant('autoAttendant.scheduleHolidays');
      var openHoursLabel = $translate.instant('autoAttendant.scheduleOpen');
      var closedHolidayHoursLabel = $translate.instant('autoAttendant.scheduleClosedHolidays');

      /* check holiday value to determine if holiday uses open closed or holiday lane */

      var closedHoliday = _.get(ui, 'holidaysValue') === 'closedHours';
      if (ui.isOpenHours && _.has(ui, 'openHours.entries')) {
        openHoursValid = checkForValid(ui.openHours, 'openHours', openHoursLabel);
      }
      if (ui.isClosedHours && _.has(ui, 'closedHours.entries')) {
        closedHoursValid = checkForValid(ui.closedHours, 'closedHours',
          closedHoliday ? closedHolidayHoursLabel : closedHoursLabel);
      }

      /* if holiday follows closed behavior, then don't validate */
      if (ui.isHolidays && (!closedHoliday) && _.has(ui, 'holidays.entries')) {
        holidaysValid = checkForValid(ui.holidays, 'holidays', holidayHoursLabel);
      }

      return openHoursValid && closedHoursValid && holidaysValid;

    }

    function checkForValid(uiCombinedMenu, fromLane, scheduleLabel) {
      var isValid = true;
      var error;

      /* save menuOptions array so we can compute which Phone menu  had 
         the offending field */

      var menuOptions = _.filter(uiCombinedMenu.entries, {
        'type': 'MENU_OPTION'
      });

      /* segregate the RouteCall menus so we can determine which 
         RouteCall menu has the error
       */

      var routeTosOnly = _.filter(uiCombinedMenu.entries, function (menu) {
        var actionName = _.get(menu, 'actions[0].name');
        return _.find(routeToCalls, {
          'name': actionName
        });
      });

      /* we need to iterate over the original array so we can discern the 
         position ('index') of this menu. Needed for aaCommonService.js's 
         getInvalid()
       */

      _.forEach(uiCombinedMenu.entries, function (optionMenu, index) {

        if (optionMenu.type === 'MENU_OPTION') {

          var errors = [];

          if (_.has(optionMenu, 'entries')) {
            errors = checkAllKeys(optionMenu, index, fromLane);
          }

          _.forEach(errors, function (err) {
            isValid = false;

            AANotificationService.error(err.msg, {
              key: err.key,
              schedule: scheduleLabel,
              at: _.indexOf(menuOptions, optionMenu) + 1
            });
          });

          return;

        } /* option in menu (phone) */
        /* else must be welcome menu - process routeCalls */

        error = checkAllActions(optionMenu, index, fromLane);

        if (error) {
          isValid = false;

          AANotificationService.error(error, {
            schedule: scheduleLabel,
            at: _.indexOf(routeTosOnly, optionMenu) + 1
          });
        }

      });

      return isValid;

    }
  }
})();
