(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .factory('AACesOnboardService', AACesOnboardService);

  /* @ngInject */

  function AACesOnboardService($resource, HuronConfig) {
    return $resource(HuronConfig.getCesUrl() + '/customers/:customerId/config', {
      customerId: '@customerId',
    }, {
      update: {
        method: 'PUT',
        isArray: false,
      },
    });
  }
})();
