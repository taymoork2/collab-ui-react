(function () {
  'use strict';

  /* @ngInject */
  function PartnerManagementService($q, $http, UrlConfig) {
    // exports
    var service = {
      search: search,
      create: create,
    };

    function search(email) {
      return $http.get(UrlConfig.getAdminServiceUrl() +
        'organizations/search?emailAddress=' + encodeURIComponent(email));
    }

    function create(data) {
      var postData = {
        'partnerOrgName': data.name,
        'partnerAdminEmail': data.email,
        'partnerType': data.partnerType.value,
        'isPartner': true,
        'isLifecyclePartner': ((data.lifeCyclePartner === true) ? 'true' : 'false'),
      };

      var deferred = $q.defer();

      $http({
        url: UrlConfig.getAdminServiceUrl() + 'partners',
        method: 'POST',
        data: postData,
        headers: { 'Content-Type': 'application/json' },
      }).then(function (resp) {
        deferred.resolve(resp);
      }, function (resp) {
        deferred.reject(resp);
      });

      return deferred.promise;
    }

    return service;
  }

  angular.module('Squared')
    .service('PartnerManagementService', PartnerManagementService);
})();
