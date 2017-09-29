(function () {
  'use strict';

  module.exports = WebexMetricsService;

  /* @ngInject */
  function WebexMetricsService($http, Authinfo, UrlConfig) {
    var orgId = Authinfo.getOrgId();
    var webexSiteUrl = UrlConfig.getAdminServiceUrl() + 'organizations/' + orgId + '/siteUrls'; //AccountService.getAccounts

    var service = {
      getWebexSites: getWebexSites,
    };

    return service;

    function getWebexSites() {
      return $http.get(webexSiteUrl);
    }
  }
})();
