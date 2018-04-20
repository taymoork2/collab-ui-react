// TODO: convert this file to TypeScript

(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .factory('AALocationsService', AALocationsService)
    .factory('AALocationService', AALocationService);

  /* fetch all locations for multi-site */
  function AALocationsService($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiV2Url() + '/customers/:customerId/locations', {
      customerId: '@customerId',
    }, {
      get: {
        method: 'GET',
      },
    });
  }
  /* fetch a particular location's info */
  function AALocationService($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiV2Url() + '/customers/:customerId/locations/:locId', {
      customerId: '@customerId',
      locId: '@locId',
    }, {
      get: {
        method: 'GET',
      },
    });
  }
})();
