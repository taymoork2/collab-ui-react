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
    .factory('TerminusNumberService', function ($resource, HuronConfig) {
      return $resource(HuronConfig.getTerminusUrl() + '/customers/:customerId/dids/:did', {}, {});
    })
    .factory('TerminusCarrierService', function ($resource, HuronConfig) {
      return $resource(HuronConfig.getTerminusUrl() + '/carriers/:carrierId', {});
    })
    .factory('TerminusCarrierInventory', function ($resource, HuronConfig) {
      return $resource(HuronConfig.getTerminusUrl() + '/carriers/:carrierId/did/inventory/count');
    })
    .factory('TerminusStateService', function ($resource) {
      return $resource('modules/huron/pstnSetup/states.json', {}, {
        query: {
          method: 'GET',
          isArray: true,
          cache: true
        }
      });
    });

})();
