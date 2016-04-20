(function () {
  'use strict';

  angular.module('Core')
    .service('SparkDomainManagementService', sparkDomainManagementService);

  /* @ngInject */
  function sparkDomainManagementService($http, $q, Config, Authinfo, UrlConfig) {
    var sparksUrl = UrlConfig.getSparkDomainManagementUrl() + 'organizations/' + Authinfo.getOrgId() + '/settings/domain';
    var service = {
      checkDomainAvailability: checkDomainAvailability,
      addSipUriDomain: addSipUriDomain
    };

    return service;

    function checkDomainAvailability(domain) {
      if (!domain || domain === '') {
        return $q.reject('A SIP URI Domain input value must be entered');
      }

      var domainName = domain + UrlConfig.getSparkDomainCheckUrl();
      var payload = {
        'name': domainName,
        'isVerifyDomainOnly': true
      };

      return $http.post(sparksUrl, payload, {
        caching: true
      });
    }

    function addSipUriDomain(domain) {
      if (!domain || domain === '') {
        return $q.reject('A SIP URI Domain input value must be entered');
      }

      var domainName = domain + UrlConfig.getSparkDomainCheckUrl();
      var payload = {
        'name': domainName,
        'isVerifyDomainOnly': false
      };

      return $http.post(sparksUrl, payload);
    }
  }
})();
