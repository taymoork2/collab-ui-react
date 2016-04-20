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
    .factory('TerminusResellerCarrierService', function ($resource, HuronConfig) {
      return $resource(HuronConfig.getTerminusUrl() + '/resellers/:resellerId/carriers/:carrierId', {}, {});
    })
    .factory('TerminusCustomerCarrierService', function ($resource, HuronConfig) {
      return $resource(HuronConfig.getTerminusUrl() + '/customers/:customerId/carriers/:carrierId', {}, {});
    })
    .factory('TerminusCustomerSiteService', function ($resource, HuronConfig) {
      return $resource(HuronConfig.getTerminusUrl() + '/customers/:customerId/sites/:siteId', {}, {
        update: {
          method: 'PUT'
        }
      });
    })
    .factory('TerminusCustomerCarrierDidService', function ($resource, HuronConfig) {
      return $resource(HuronConfig.getTerminusUrl() + '/customers/:customerId/carriers/:carrierId/did/:type', {}, {});
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
    .factory('TerminusCarrierInventoryCount', function ($resource, HuronConfig) {
      return $resource(HuronConfig.getTerminusUrl() + '/inventory/carriers/:carrierId/did/count');
    })
    .factory('TerminusCarrierInventorySearch', function ($resource, HuronConfig) {
      return $resource(HuronConfig.getTerminusUrl() + '/inventory/carriers/:carrierId/did/search');
    })
    .factory('TerminusCarrierInventoryReserve', function ($resource, HuronConfig) {
      return $resource(HuronConfig.getTerminusUrl() + '/inventory/carriers/:carrierId/did/reserve');
    })
    .factory('TerminusCarrierInventoryRelease', function ($resource, HuronConfig) {
      return $resource(HuronConfig.getTerminusUrl() + '/inventory/carriers/:carrierId/did/release');
    })
    .factory('TerminusCustomerCarrierInventoryReserve', function ($resource, HuronConfig) {
      return $resource(HuronConfig.getTerminusUrl() + '/inventory/customers/:customerId/carriers/:carrierId/did/reserve');
    })
    .factory('TerminusCustomerCarrierInventoryRelease', function ($resource, HuronConfig) {
      return $resource(HuronConfig.getTerminusUrl() + '/inventory/customers/:customerId/carriers/:carrierId/did/release');
    })
    .factory('TerminusStateService', function ($resource) {
      return $resource('modules/huron/pstnSetup/states.json', {}, {
        query: {
          method: 'GET',
          isArray: true,
          cache: true
        }
      });
    })
    .factory('TerminusLookupE911Service', function ($resource, HuronConfig) {
      return $resource(HuronConfig.getTerminusUrl() + '/lookup/e911');
    });

})();
