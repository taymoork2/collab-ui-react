(function () {
  'use strict';
  angular
    .module('Sunlight')
    .factory('ConfigTemplateService', ConfigTemplateService)
    .factory('ConfigUserService', ConfigUserService);

  /* @ngInject */
  function ConfigTemplateService($resource, UrlConfig) {
    var baseUrl = UrlConfig.getSunlightConfigServiceUrl();
    return $resource(baseUrl + '/organization/:orgId/template/:templateId', {
      orgId: '@orgId',
      templateId: '@templateId'
    }, {
      update: {
        method: 'PUT'
      },
      delete: {
        method: 'DELETE'
      }
    });
  }

  /* @ngInject */
  function ConfigUserService($resource, UrlConfig) {
    var baseUrl = UrlConfig.getSunlightConfigServiceUrl();
    return $resource(baseUrl + '/user:userId', {
      userId: '@userId'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
})();
