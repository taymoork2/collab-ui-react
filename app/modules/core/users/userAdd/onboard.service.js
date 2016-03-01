(function () {
  'use strict';

  angular
    .module('core.onboard')
    .factory('OnboardService', OnboardService);

  /* @ngInject */
  function OnboardService(HybridService) {
    var service = {
      huronCallEntitlement: false
    };

    return service;

    ////////////////
  }
})();
