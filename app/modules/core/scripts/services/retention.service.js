(function () {
  'use strict';

  angular
    .module('Core')
    .service('RetentionService', RetentionService);

  /* @ngInject */
  function RetentionService($http, $q, UrlConfig) {
    var accountUrl = UrlConfig.getAdminServiceUrl();

    var service = {
      getRetention: getRetention,
      setRetention: setRetention
    };

    return service;

    function getRetentionUrl(org) {
      return accountUrl + 'organizations/' + org + '/settings/msgDataRetention';
    }

    function getRetention(org) {
      if (!org || org == '')
        return $q.reject("No organization was provided.");

      var url = getRetentionUrl(org);

      return $http.get(url);
    }

    function setRetention(org, days) {
      if (!org || org == '')
        return $q.reject("No organization was provided.");
      if (!days || days == '')
        return $q.reject("No retention was provided.");

      var url = getRetentionUrl(org);

      var payload = {
        'msgDataRetention': days
      };

      return $http.put(url, payload);
    }
  }
})();
