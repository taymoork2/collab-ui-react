(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .factory('AAValidationService', AAValidationService);

  /* @ngInject */
  function AAValidationService(AAModelService, AutoAttendantCeInfoModelService, Notification) {

    var service = {
      isNameValidationSuccess: isNameValidationSuccess
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
  }
})();
