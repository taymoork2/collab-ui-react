(function () {
  'use strict';

  /* @ngInject */
  function ConfigTemplateService($resource, UrlConfig) {
    var baseUrl = UrlConfig.getSunlightConfigServiceUrl();
    return $resource(baseUrl + '/organization/:orgId/template/:templateId', {
      orgId: '@orgId',
      templateId: '@templateId',
    }, {
      update: {
        method: 'PUT',
      },
      delete: {
        method: 'DELETE',
      },
    });
  }

  /* @ngInject */
  function ConfigUserService($resource, UrlConfig) {
    var baseUrl = UrlConfig.getSunlightConfigServiceUrl();
    return $resource(baseUrl + '/user:userId', {
      userId: '@userId',
    }, {
      update: {
        method: 'PUT',
      },
    });
  }

  module.exports.ConfigTemplateService = ConfigTemplateService;
  module.exports.ConfigUserService = ConfigUserService;

})();
