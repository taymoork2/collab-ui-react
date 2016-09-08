(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .factory('CeService', CeService)
    .factory('CeSiteService', CeSiteService);

  /* @ngInject */
  function CeService($resource, HuronConfig) {
    return $resource(HuronConfig.getCesUrl() + '/customers/:customerId/callExperiences/:ceId', {
      customerId: '@customerId',
      ceId: '@ceId'
    }, {
      'update': {
        method: 'PUT',
        isArray: false
      }
    });
  }

  function CeSiteService($resource, HuronConfig) {
    return $resource(HuronConfig.getCesUrl() + '/customers/:customerId/sites', {
      customerId: '@customerId'
    }, {
      'update': {
        method: 'PUT',
        isArray: false
      }
    });
  }
})();
