(function () {
  'use strict';

  module.exports = angular.module('core.sparkDomainManagementService', [
  ])
    .service('SparkDomainManagementService', sparkDomainManagementService)
    .name;

  /* @ngInject */
  function sparkDomainManagementService($http, $q, Authinfo, UrlConfig) {
    var sparksUrl = UrlConfig.getSparkDomainManagementUrl() + 'organizations/' + Authinfo.getOrgId() + '/settings/domain';
    var service = {
      checkDomainAvailability: checkDomainAvailability,
      addSipDomain: addSipDomain,
    };

    return service;

    function checkDomainAvailability(domain) {
      if (!domain || domain === '') {
        return $q.reject('A SIP Domain input value must be entered');
      }

      var domainName = domain + UrlConfig.getSparkDomainCheckUrl();
      var payload = {
        name: domainName,
        isVerifyDomainOnly: true,
      };

      return $http.post(sparksUrl, payload, {
        caching: true,
      });
    }

    function addSipDomain(domain) {
      if (!domain || domain === '') {
        return $q.reject('A SIP Domain input value must be entered');
      }

      var domainName = domain + UrlConfig.getSparkDomainCheckUrl();
      var payload = {
        name: domainName,
        isVerifyDomainOnly: false,
      };

      return $http.post(sparksUrl, payload);
    }
  }
})();
