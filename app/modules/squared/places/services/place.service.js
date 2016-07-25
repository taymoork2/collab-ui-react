(function () {
  'use strict';
  angular
    .module('Huron')
    .factory('PlaceService', PlaceService);

  function PlaceService($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiV2Url() + '/customers/:customerId/places', {
      customerId: '@customerId'
    }, {
      save: {
        method: 'POST',
        headers: {
          'Access-Control-Expose-Headers': 'Location'
        }
      }
    });
  }
})();
