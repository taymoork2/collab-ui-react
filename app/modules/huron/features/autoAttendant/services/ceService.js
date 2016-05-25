(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .factory('CeService', CeService);

  /* @ngInject */
  function CeService($resource, HuronConfig) {
    return $resource(HuronConfig.getCesUrl() + '/customers/:customerId/callExperiences/:ceId', {
      customerId: '@customerId',
      ceId: '@ceId'
    }, {
      'update': {
        method: 'PUT',
        isArray: false
      }
    });
  }
})();
