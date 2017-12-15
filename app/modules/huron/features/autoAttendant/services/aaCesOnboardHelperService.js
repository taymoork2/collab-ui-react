// TODO: convert this file to TypeScript
(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .factory('AACesOnboardHelperService', AACesOnboardHelperService);

  /* @ngInject */
  function AACesOnboardHelperService(AACesOnboardService, Authinfo) {
    var service = {
      isCesOnBoarded: isCesOnBoarded,
    };
    return service;
    /////////////////////

    function isCesOnBoarded() {
      return AACesOnboardService.get({
        customerId: Authinfo.getOrgId(),
      }).$promise;
    }
  }
})();
