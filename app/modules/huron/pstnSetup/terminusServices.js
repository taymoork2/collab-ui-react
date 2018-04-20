(function () {
  'use strict';

  var LazyResource = require('modules/core/scripts/services/lazyResource').default;

  module.exports = angular.module('huron.TerminusServices', [
    require('angular-resource'),
    require('modules/huron/telephony/telephonyConfig'),
    require('modules/core/config/config').default,
  ])
    .factory('TerminusCustomerService', TerminusCustomerService)
    .factory('TerminusCustomerV2Service', TerminusCustomerV2Service)
    .factory('TerminusCustomerTrialV2Service', TerminusCustomerTrialV2Service)
    .factory('TerminusResellerCarrierService', TerminusResellerCarrierService)
    .factory('TerminusResellerCarrierV2Service', TerminusResellerCarrierV2Service)
    .factory('TerminusCustomerCarrierService', TerminusCustomerCarrierService)
    .factory('TerminusCustomerNumberService', TerminusCustomerNumberService)
    .factory('TerminusCustomerSiteService', TerminusCustomerSiteService)
    .factory('TerminusCustomerCarrierDidService', TerminusCustomerCarrierDidService)
    .factory('TerminusCustomerPortService', TerminusCustomerPortService)
    .factory('TerminusOrderService', TerminusOrderService)
    .factory('TerminusOrderV2Service', TerminusOrderV2Service)
    .factory('TerminusCarrierService', TerminusCarrierService)
    .factory('TerminusCarrierV2Service', TerminusCarrierV2Service)
    .factory('TerminusV2LookupE911Service', TerminusV2LookupE911Service)
    .factory('TerminusUserDeviceE911Service', TerminusUserDeviceE911Service)
    .factory('TerminusV2CarrierNumberService', TerminusV2CarrierNumberService)
    .factory('TerminusV2CarrierNumberCountService', TerminusV2CarrierNumberCountService)
    .factory('TerminusV2CarrierCapabilitiesService', TerminusV2CarrierCapabilitiesService)
    .factory('TerminusV2CustomerService', TerminusV2CustomerService)
    .factory('TerminusV2CustomerNumberOrderBlockService', TerminusV2CustomerNumberOrderBlockService)
    .factory('TerminusV2CustomerNumberOrderPortService', TerminusV2CustomerNumberOrderPortService)
    .factory('TerminusV2CustomerNumberReservationService', TerminusV2CustomerNumberReservationService)
    .factory('TerminusV2CustomerTrialService', TerminusV2CustomerTrialService)
    .factory('TerminusV2ResellerService', TerminusV2ResellerService)
    .factory('TerminusV2ResellerCarrierNumberReservationService', TerminusV2ResellerCarrierNumberReservationService)
    .factory('TerminusV2ResellerNumberReservationService', TerminusV2ResellerNumberReservationService)
    .name;

  /* @ngInject */
  function TerminusCustomerService($resource, HuronConfig) {
    return LazyResource($resource, function () {
      return HuronConfig.getTerminusUrl() + '/customers/:customerId';
    }, {}, {
      update: {
        method: 'PUT',
      },
    });
  }

  /* @ngInject */
  function TerminusCustomerV2Service($resource, HuronConfig) {
    return LazyResource($resource, function () {
      return HuronConfig.getTerminusV2Url() + '/customers/:customerId';
    }, {}, {
      update: {
        method: 'PUT',
      },
    });
  }

  /* @ngInject */
  function TerminusCustomerTrialV2Service($resource, HuronConfig) {
    return LazyResource($resource, function () {
      return HuronConfig.getTerminusV2Url() + '/customers/:customerId/trials';
    }, {}, {
      update: {
        method: 'PUT',
      },
    });
  }

  /* @ngInject */
  function TerminusResellerCarrierService($resource, HuronConfig) {
    return LazyResource($resource, function () {
      return HuronConfig.getTerminusUrl() + '/resellers/:resellerId/carriers/:carrierId';
    }, {}, {});
  }

  /* @ngInject */
  function TerminusResellerCarrierV2Service($resource, HuronConfig) {
    return LazyResource($resource, function () {
      return HuronConfig.getTerminusV2Url() + '/resellers/:resellerId/carriers/:carrierId';
    }, {}, {});
  }

  /* @ngInject */
  function TerminusCustomerCarrierService($resource, HuronConfig) {
    return LazyResource($resource, function () {
      return HuronConfig.getTerminusUrl() + '/customers/:customerId/carriers/:carrierId';
    }, {}, {});
  }

  /* @ngInject */
  function TerminusCustomerSiteService($resource, HuronConfig) {
    return LazyResource($resource, function () {
      return HuronConfig.getTerminusUrl() + '/customers/:customerId/sites/:siteId';
    }, {}, {
      update: {
        method: 'PUT',
      },
    });
  }

  /* @ngInject */
  function TerminusCustomerCarrierDidService($resource, HuronConfig) {
    return LazyResource($resource, function () {
      return HuronConfig.getTerminusUrl() + '/customers/:customerId/carriers/:carrierId/did/:type';
    }, {}, {});
  }

  /* @ngInject */
  function TerminusCustomerPortService($resource, HuronConfig) {
    return LazyResource($resource, function () {
      return HuronConfig.getTerminusV2Url() + '/customers/:customerId/numbers/orders/ports';
    }, {}, {});
  }

  /* @ngInject */
  function TerminusOrderService($resource, HuronConfig) {
    return $resource(HuronConfig.getTerminusUrl() + '/customers/:customerId/orders/:orderId', {}, {});
  }

  /* @ngInject */
  function TerminusOrderV2Service($resource, HuronConfig) {
    return LazyResource($resource, function () {
      return HuronConfig.getTerminusV2Url() + '/customers/:customerId/numbers/orders/:orderId';
    }, {}, {});
  }

  /* @ngInject */
  function TerminusCustomerNumberService($resource, HuronConfig) {
    return LazyResource($resource, function () {
      return HuronConfig.getTerminusV2Url() + '/customers/:customerId/numbers/:number';
    }, {}, {});
  }

  /* @ngInject */
  function TerminusCarrierService($resource, HuronConfig) {
    return LazyResource($resource, function () {
      return HuronConfig.getTerminusUrl() + '/carriers/:carrierId';
    }, {});
  }

  /* @ngInject */
  function TerminusCarrierV2Service($resource, HuronConfig) {
    return LazyResource($resource, function () {
      return HuronConfig.getTerminusV2Url() + '/carriers/:carrierId';
    }, {});
  }

  /* @ngInject */
  function TerminusV2LookupE911Service($resource, HuronConfig) {
    return LazyResource($resource, function () {
      return HuronConfig.getTerminusV2Url() + '/carriers/:carrierId/e911/lookup';
    });
  }

  /* @ngInject */
  function TerminusUserDeviceE911Service($resource, HuronConfig) {
    return $resource(HuronConfig.getTerminusV2Url() + '/customers/:customerId/numbers/:number/e911', {}, {
      update: {
        method: 'PUT',
      },
    });
  }

  /* @ngInject */
  function TerminusV2CarrierNumberService($resource, HuronConfig) {
    return LazyResource($resource, function () {
      return HuronConfig.getTerminusV2Url() + '/carriers/:carrierId/numbers';
    });
  }

  /* @ngInject */
  function TerminusV2CarrierNumberCountService($resource, HuronConfig) {
    return LazyResource($resource, function () {
      return HuronConfig.getTerminusV2Url() + '/carriers/:carrierId/numbers/count';
    });
  }

  /* @ngInject */
  function TerminusV2CarrierCapabilitiesService($resource, HuronConfig) {
    return LazyResource($resource, function () {
      return HuronConfig.getTerminusV2Url() + '/carriers/:carrierId/capabilities';
    }, {}, {
      query: {
        method: 'GET',
        isArray: true,
        cache: true,
      },
    });
  }

  /* @ngInject */
  function TerminusV2CustomerService($resource, HuronConfig) {
    return $resource(HuronConfig.getTerminusV2Url() + '/customers/:customerId');
  }

  /* @ngInject */
  function TerminusV2CustomerNumberOrderBlockService($resource, HuronConfig) {
    return LazyResource($resource, function () {
      return HuronConfig.getTerminusV2Url() + '/customers/:customerId/numbers/orders/blocks';
    });
  }

  /* @ngInject */
  function TerminusV2CustomerNumberOrderPortService($resource, HuronConfig) {
    return $resource(HuronConfig.getTerminusV2Url() + '/customers/:customerId/numbers/orders/ports');
  }

  /* @ngInject */
  function TerminusV2CustomerNumberReservationService($resource, HuronConfig) {
    return LazyResource($resource, function () {
      return HuronConfig.getTerminusV2Url() + '/customers/:customerId/numbers/reservations/:reservationId';
    }, {}, {
      save: {
        headers: {
          'Access-Control-Expose-Headers': 'Location',
        },
        method: 'POST',
      },
    });
  }

  /* @ngInject */
  function TerminusV2CustomerTrialService($resource, HuronConfig) {
    return $resource(HuronConfig.getTerminusV2Url() + '/customers/:customerId/trial');
  }

  /* @ngInject */
  function TerminusV2ResellerService($resource, HuronConfig) {
    return LazyResource($resource, function () {
      return HuronConfig.getTerminusV2Url() + '/resellers/:resellerId';
    });
  }

  /* @ngInject */
  function TerminusV2ResellerCarrierNumberReservationService($resource, HuronConfig) {
    return LazyResource($resource, function () {
      return HuronConfig.getTerminusV2Url() + '/resellers/:resellerId/carriers/:carrierId/numbers/reservations';
    }, {}, {
      save: {
        headers: {
          'Access-Control-Expose-Headers': 'Location',
        },
        method: 'POST',
      },
    });
  }

  /* @ngInject */
  function TerminusV2ResellerNumberReservationService($resource, HuronConfig) {
    return LazyResource($resource, function () {
      return HuronConfig.getTerminusV2Url() + '/resellers/:resellerId/numbers/reservations/:reservationId';
    });
  }
})();
