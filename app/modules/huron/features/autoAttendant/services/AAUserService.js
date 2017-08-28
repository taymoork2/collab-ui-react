// TODO: convert this file to TypeScript

(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .factory('AAUserService', AAUserService);

  function AAUserService($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiV2Url() + '/customers/:customerId/users/:userId', {
      customerId: '@customerId',
      userId: '@userId',
    }, {
      get: {
        method: 'GET',
      },
    });
  }
})();
