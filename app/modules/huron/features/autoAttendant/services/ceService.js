(function () {
  'use strict';

  module.exports = angular
    .module('uc.autoattendant.ce-service', [
      require('angular-resource'),
    ])
    .factory('CeService', CeService)
    .factory('CeSiteService', CeSiteService)
    .name;

  /* @ngInject */
  function CeService($resource, HuronConfig) {
    return $resource(HuronConfig.getCesUrl() + '/customers/:customerId/callExperiences/:ceId', {
      customerId: '@customerId',
      ceId: '@ceId',
    }, {
      'update': {
        method: 'PUT',
        isArray: false,
      },
    });
  }

  function CeSiteService($resource, HuronConfig) {
    return $resource(HuronConfig.getCesUrl() + '/customers/:customerId/sites', {
      customerId: '@customerId',
    }, {
      'update': {
        method: 'PUT',
        isArray: false,
      },
    });
  }
})();
