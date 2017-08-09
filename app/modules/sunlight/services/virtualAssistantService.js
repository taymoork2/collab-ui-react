(function () {
  'use strict';

  /* @ngInject */
  function virtualAssistantService($http, Authinfo, UrlConfig) {
    var botServiceConfigUrl = UrlConfig.getBotServicesConfigUrl() + 'config/organization/' + Authinfo.getOrgId() + '/botconfig';

    var service = {
      getConfiguredVirtualAssistantServices: getConfiguredVirtualAssistantServices,
    };
    return service;

    function getConfiguredVirtualAssistantServices() {
      return $http.get(botServiceConfigUrl);
    }
  }

  module.exports = virtualAssistantService;
})();
