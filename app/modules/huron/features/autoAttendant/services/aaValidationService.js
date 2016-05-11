(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .factory('AAValidationService', AAValidationService);

  /* @ngInject */
  function AAValidationService(AAModelService, AutoAttendantCeInfoModelService, AANotificationService) {

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
        if (entry.key && 'routeToQueue' === entry.actions[0].name && !entry.actions[0].value) {
          outErrors.push({
            msg: 'autoAttendant.phoneMenuErrorRouteToQueueTargetMissing',
            key: entry.key
          });
        }
      });

      return outErrors;

    }

    function isPhoneMenuValidationSuccess(uiCombinedMenu) {
      var optionMenu = _.find(uiCombinedMenu.entries, function (entry) {
        return this === entry.type;
      }, 'MENU_OPTION');

      var errors = [];

      if (angular.isDefined(optionMenu) && angular.isDefined(optionMenu.entries)) {
        errors = checkAllKeys(optionMenu);

        _.forEach(errors, function (err) {
          AANotificationService.error(err.msg, {
            key: err.key
          });
        });
      }

      return errors.length === 0;
    }
  }
})();
