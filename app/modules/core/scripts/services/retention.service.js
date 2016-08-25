(function () {
  'use strict';

  angular
    .module('Core')
    .service('RetentionService', RetentionService);

  /* @ngInject */
  function RetentionService($resource, $q, UrlConfig) {
    var accountUrl = UrlConfig.getAdminServiceUrl();

    var retentionResource = $resource(accountUrl + 'organizations/:orgId/settings/sparkDataRetentionDays', {
      orgId: '@orgId'
    }, {
      get: {
        method: 'GET'
      },
      update: {
        method: 'PUT'
      }
    });

    var service = {
      getRetention: getRetention,
      setRetention: setRetention
    };

    return service;

    function getRetention(org) {
      if (!org || org == '') {
        return $q.reject("No organization was provided.");
      }

      return retentionResource.get({
        orgId: org
      }).$promise;
    }

    function setRetention(org, days) {
      if (!org || org == '') {
        return $q.reject("No organization was provided.");
      }
      if (!days || days == '') {
        return $q.reject("No retention was provided.");
      }

      var payload = {
        sparkDataRetentionDays: days
      };

      return retentionResource.update({
        orgId: org
      }, payload).$promise;
    }
  }
})();
