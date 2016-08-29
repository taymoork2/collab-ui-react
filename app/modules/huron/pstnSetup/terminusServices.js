(function () {
  'use strict';

  angular.module('Huron')
    .factory('TerminusCustomerService', TerminusCustomerService)
    .factory('TerminusResellerCarrierService', TerminusResellerCarrierService)
    .factory('TerminusCustomerCarrierService', TerminusCustomerCarrierService)
    .factory('TerminusCustomerSiteService', TerminusCustomerSiteService)
    .factory('TerminusCustomerCarrierDidService', TerminusCustomerCarrierDidService)
    .factory('TerminusCustomerCarrierTollFreeService', TerminusCustomerCarrierTollFreeService)
    .factory('TerminusOrderService', TerminusOrderService)
    .factory('TerminusNumberService', TerminusNumberService)
    .factory('TerminusCarrierService', TerminusCarrierService)
    .factory('TerminusCarrierInventoryCount', TerminusCarrierInventoryCount)
    .factory('TerminusCarrierInventorySearch', TerminusCarrierInventorySearch)
    .factory('TerminusCarrierInventoryReserve', TerminusCarrierInventoryReserve)
    .factory('TerminusCarrierInventoryRelease', TerminusCarrierInventoryRelease)
    .factory('TerminusCarrierTollFreeInventoryCount', TerminusCarrierTollFreeInventoryCount)
    .factory('TerminusCarrierTollFreeInventoryRelease', TerminusCarrierTollFreeInventoryRelease)
    .factory('TerminusCarrierTollFreeInventoryReserve', TerminusCarrierTollFreeInventoryReserve)
    .factory('TerminusCarrierTollFreeInventorySearch', TerminusCarrierTollFreeInventorySearch)
    .factory('TerminusCustomerCarrierInventoryReserve', TerminusCustomerCarrierInventoryReserve)
    .factory('TerminusCustomerCarrierInventoryRelease', TerminusCustomerCarrierInventoryRelease)
    .factory('TerminusCustomerCarrierTollFreeInventoryRelease', TerminusCustomerCarrierTollFreeInventoryRelease)
    .factory('TerminusCustomerCarrierTollFreeInventoryReserve', TerminusCustomerCarrierTollFreeInventoryReserve)
    .factory('TerminusStateService', TerminusStateService)
    .factory('TerminusLookupE911Service', TerminusLookupE911Service);

  /* @ngInject */
  function TerminusCustomerService($resource, HuronConfig) {
    return $resource(HuronConfig.getTerminusUrl() + '/customers/:customerId', {}, {
      update: {
        method: 'PUT'
      }
    });
  }

  /* @ngInject */
  function TerminusResellerCarrierService($resource, HuronConfig) {
    return $resource(HuronConfig.getTerminusUrl() + '/resellers/:resellerId/carriers/:carrierId', {}, {});
  }

  /* @ngInject */
  function TerminusCustomerCarrierService($resource, HuronConfig) {
    return $resource(HuronConfig.getTerminusUrl() + '/customers/:customerId/carriers/:carrierId', {}, {});
  }

  /* @ngInject */
  function TerminusCustomerSiteService($resource, HuronConfig) {
    return $resource(HuronConfig.getTerminusUrl() + '/customers/:customerId/sites/:siteId', {}, {
      update: {
        method: 'PUT'
      }
    });
  }

  /* @ngInject */
  function TerminusCustomerCarrierDidService($resource, HuronConfig) {
    return $resource(HuronConfig.getTerminusUrl() + '/customers/:customerId/carriers/:carrierId/did/:type', {}, {});
  }

  /* @ngInject */
  function TerminusCustomerCarrierTollFreeService($resource) {
    return $resource('modules/huron/pstnSetup/tollFreeEmptyDummyResponse.json', {}, {
      // TODO: Remove this "save" override and replace with tollfree number APIs when they are ready.
      save: {
        method: 'GET'
      }
    });
  }

  /* @ngInject */
  function TerminusOrderService($resource, HuronConfig) {
    return $resource(HuronConfig.getTerminusUrl() + '/customers/:customerId/orders/:orderId', {}, {});
  }

  /* @ngInject */
  function TerminusNumberService($resource, HuronConfig) {
    return $resource(HuronConfig.getTerminusUrl() + '/customers/:customerId/dids/:did', {}, {});
  }

  /* @ngInject */
  function TerminusCarrierService($resource, HuronConfig) {
    return $resource(HuronConfig.getTerminusUrl() + '/carriers/:carrierId', {});
  }

  /* @ngInject */
  function TerminusCarrierInventoryCount($resource, HuronConfig) {
    return $resource(HuronConfig.getTerminusUrl() + '/inventory/carriers/:carrierId/did/count');
  }

  /* @ngInject */
  function TerminusCarrierInventorySearch($resource, HuronConfig) {
    return $resource(HuronConfig.getTerminusUrl() + '/inventory/carriers/:carrierId/did/search');
  }

  /* @ngInject */
  function TerminusCarrierInventoryReserve($resource, HuronConfig) {
    return $resource(HuronConfig.getTerminusUrl() + '/inventory/carriers/:carrierId/did/reserve');
  }

  /* @ngInject */
  function TerminusCarrierInventoryRelease($resource, HuronConfig) {
    return $resource(HuronConfig.getTerminusUrl() + '/inventory/carriers/:carrierId/did/release');
  }

  /* @ngInject */
  function TerminusCarrierTollFreeInventoryCount($resource) {
    return $resource('modules/huron/pstnSetup/tollFreeAreaCodesDummyResults.json', {}, {});
  }

  /* @ngInject */
  function TerminusCarrierTollFreeInventoryRelease($resource) {
    return $resource('modules/huron/pstnSetup/tollFreeEmptyDummyResponse.json', {}, {
      // TODO: Remove this "save" override and replace with tollfree number APIs when they are ready.
      save: {
        method: 'GET'
      }
    });
  }

  /* @ngInject */
  function TerminusCarrierTollFreeInventoryReserve($resource) {
    return $resource('modules/huron/pstnSetup/tollFreeEmptyDummyResponse.json', {}, {
      // TODO: Remove this "save" override and replace with tollfree number APIs when they are ready.
      save: {
        method: 'GET'
      }
    });
  }

  /* @ngInject */
  function TerminusCarrierTollFreeInventorySearch($resource) {
    return $resource('modules/huron/pstnSetup/tollFreeSearchDummyResults.json', {}, {});
  }

  /* @ngInject */
  function TerminusCustomerCarrierInventoryReserve($resource, HuronConfig) {
    return $resource(HuronConfig.getTerminusUrl() + '/inventory/customers/:customerId/carriers/:carrierId/did/reserve');
  }

  /* @ngInject */
  function TerminusCustomerCarrierInventoryRelease($resource, HuronConfig) {
    return $resource(HuronConfig.getTerminusUrl() + '/inventory/customers/:customerId/carriers/:carrierId/did/release');
  }

  function TerminusCustomerCarrierTollFreeInventoryReserve($resource) {
    return $resource('modules/huron/pstnSetup/tollFreeEmptyDummyResponse.json', {}, {
      // TODO: Remove this "save" override and replace with tollfree number APIs when they are ready.
      save: {
        method: 'GET'
      }
    });
  }

  /* @ngInject */
  function TerminusCustomerCarrierTollFreeInventoryRelease($resource) {
    return $resource('modules/huron/pstnSetup/tollFreeEmptyDummyResponse.json', {}, {
      // TODO: Remove this "save" override and replace with tollfree number APIs when they are ready.
      save: {
        method: 'GET'
      }
    });
  }

  /* @ngInject */
  function TerminusStateService($resource) {
    return $resource('modules/huron/pstnSetup/states.json', {}, {
      query: {
        method: 'GET',
        isArray: true,
        cache: true
      }
    });
  }

  /* @ngInject */
  function TerminusLookupE911Service($resource, HuronConfig) {
    return $resource(HuronConfig.getTerminusUrl() + '/lookup/e911');
  }
})();
