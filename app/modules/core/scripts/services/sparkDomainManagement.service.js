(function () {
  'use strict';

  angular.module('Core')
    .service('SparkDomainManagementService', sparkDomainManagementService);

  /* @ngInject */
  function sparkDomainManagementService($http, Config, Authinfo, $q) {
    var sparksUrl = Config.getSparkDomainManagementUrl() + 'organizations/' + Authinfo.getOrgId() + '/settings/domain';
    var service = {
      checkDomainAvailability: checkDomainAvailability,
      addSipUriDomain: addSipUriDomain
    };

    return service;

    function checkDomainAvailability(domain) {
      if (!domain || domain === '') {
        return $q.reject('A Sip Uri Domain input value must be entered');
      }

      var domainName = domain + Config.getSparkDomainCheckUrl();
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
        return $q.reject('A Sip Uri Domain input value must be entered');
      }

      var domainName = domain + Config.getSparkDomainCheckUrl();
      var payload = {
        'name': domainName,
        'isVerifyDomainOnly': false
      };

      return $http.post(sparksUrl, payload);
    }
  }
})();