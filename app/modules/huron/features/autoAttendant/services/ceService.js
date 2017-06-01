(function () {
  'use strict';

  module.exports = angular
    .module('uc.autoattendant.ce-service', [
      require('angular-resource'),
    ])
    .factory('CeService', CeService)
    .factory('CeSiteService', CeSiteService)
    .factory('CeCustomVariableService', CeCustomVariableService)
    .factory('CeVariableDependeciesService', CeVariableDependeciesService)
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

  function CeCustomVariableService($resource, HuronConfig) {
    return $resource(HuronConfig.getCesUrl() + '/customers/:customerId/callExperiences/:ceId/customVariables', {
      customerId: '@customerId',
      ceId: '@ceId',
    }, {
      'update': {
        method: 'PUT',
        isArray: false,
      },
    });
  }
  function CeVariableDependeciesService($resource, HuronConfig) {
    return $resource(HuronConfig.getCesUrl() + '/customers/:customerId/customVariables/:varname/dependencies', {
      customerId: '@customerId',
      varname: '@varname',
    }, {
      'update': {
        method: 'PUT',
        isArray: false,
      },
    });
  }
})();
