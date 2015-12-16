(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .factory('AAValidationService', AAValidationService);

  /* @ngInject */
  function AAValidationService(AAModelService, AutoAttendantCeInfoModelService, Notification) {

    var service = {
      isNameValidationSuccess: isNameValidationSuccess,
      isPhoneMenuValidationSuccess: isPhoneMenuValidationSuccess
    };

    return service;

    /////////////////////

    function isNameValidationSuccess(name, uuid) {
      var aaModel = AAModelService.getAAModel();

      if (!angular.isDefined(name) || name.trim().length === 0) {
        Notification.error('autoAttendant.invalidBuilderNameMissing');
        return false;
      }

      if (!angular.isDefined(uuid)) {
        return false;
      }

      for (var i = 0; i < aaModel.ceInfos.length; i++) {
        if ((uuid !== AutoAttendantCeInfoModelService.extractUUID(aaModel.ceInfos[i].ceUrl)) && (name === aaModel.ceInfos[i].getName())) {
          Notification.error('autoAttendant.invalidBuilderNameNotUnique');
          return false;
        }
      }

      return true;
    }

    function isPhoneMenuValidationSuccess(uiCombinedMenu) {
      var optionMenu = _.find(uiCombinedMenu.entries, function (entry) {
        return this === entry.type;
      }, 'MENU_OPTION');

      if (angular.isDefined(optionMenu) && angular.isDefined(optionMenu.entries)) {
        var entry = _.find(optionMenu.entries, function (entry) {
          return entry.key && 'goto' === entry.actions[0].name && !entry.actions[0].value;
        });
        if (angular.isDefined(entry)) {
          Notification.error('autoAttendant.phoneMenuErrorRouteToAATargetMissing', {
            key: entry.key
          });
          return false;
        }
      }
      return true;
    }
  }
})();
