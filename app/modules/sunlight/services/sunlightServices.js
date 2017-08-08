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
  function VirtualAssistantConfigService($resource, UrlConfig) {
    var baseUrl = UrlConfig.getVirtualAssistantConfigServiceUrl();
    return $resource(baseUrl + '/organization/:orgId/botconfig', {
      orgId: '@orgId',
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
  module.exports.VirtualAssistantConfigService = VirtualAssistantConfigService;
  module.exports.ConfigUserService = ConfigUserService;
})();
