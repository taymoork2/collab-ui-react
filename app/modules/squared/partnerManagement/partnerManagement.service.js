(function () {
  'use strict';

  /* @ngInject */
  function PartnerManagementService($q, $http, UrlConfig) {
    var svc = {};

    svc.search = function (email) {
      return $http.get(UrlConfig.getAdminServiceUrl() +
        'organizations/search?emailAddress=' + encodeURIComponent(email));
    };

    svc.create = function (data) {
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
    };

    svc.getOrgDetails = function (org) {
      return $http.get(UrlConfig.getAdminServiceUrl() +
        'organizations/' + encodeURIComponent(org) + '/onboardinfo');
    };

    return svc;
  }

  angular.module('Squared')
    .service('PartnerManagementService', PartnerManagementService);
})();
