(function () {
  'use strict';

  angular.module('Huron')
    .factory('TerminusCustomerService', function ($resource, HuronConfig) {
      return $resource(HuronConfig.getTerminusUrl() + '/customers/:customerId', {}, {});
    })
    .factory('TerminusCustomerCarrierService', function ($resource, HuronConfig) {
      return $resource(HuronConfig.getTerminusUrl() + '/customers/:customerId/pstn/carriers/:carrierId', {}, {});
    })
    .factory('TerminusBlockOrderService', function ($resource, HuronConfig) {
      return $resource(HuronConfig.getTerminusUrl() + '/customers/:customerId/pstn/carriers/:carrierId/did/block', {}, {});
    })
    .factory('TerminusOrderService', function ($resource, HuronConfig) {
      return $resource(HuronConfig.getTerminusUrl() + '/customers/:customerId/orders/:orderId', {}, {});
    });

})();
