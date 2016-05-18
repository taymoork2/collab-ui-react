(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .factory('QueueService', function ($resource, HuronConfig) {
      return $resource(HuronConfig.getCesUrl() + '/customers/:customerId/queues/:queueId', {
        customerId: '@customerId',
        queueId: '@queueId'
      }, {
        'update': {
          method: 'PUT',
          isArray: false
        }
      });
    });
})();
