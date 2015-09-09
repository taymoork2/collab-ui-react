(function () {
  'use strict';

  angular.module('Huron')
    .factory('TerminusCustomerService', function ($resource, HuronConfig) {
      return $resource(HuronConfig.getTerminusUrl() + '/customers/:customerId', {}, {
        update: {
          method: 'PUT'
        }
      });
    })
    .factory('TerminusCustomerCarrierService', function ($resource, HuronConfig) {
      return $resource(HuronConfig.getTerminusUrl() + '/customers/:customerId/carriers/:carrierId', {}, {});
    })
    .factory('TerminusBlockOrderService', function ($resource, HuronConfig) {
      return $resource(HuronConfig.getTerminusUrl() + '/customers/:customerId/carriers/:carrierId/did/block', {}, {});
    })
    .factory('TerminusOrderService', function ($resource, HuronConfig) {
      return $resource(HuronConfig.getTerminusUrl() + '/customers/:customerId/orders/:orderId', {}, {});
    })
    .factory('TerminusCarrierService', function ($resource, HuronConfig) {
      return $resource(HuronConfig.getTerminusUrl() + '/carriers/:carrierId', {});
    });

})();
