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
      var deferred = $q.defer();

      $http({
        url: UrlConfig.getAdminServiceUrl() + 'organizations/search?emailAddress=' + encodeURIComponent(email),
        method: 'POST',
      }).then(function (resp) {
        deferred.resolve(resp);
      }, function (resp) {
        deferred.reject(resp);
      });

      return deferred.promise;
    }

    function create(data) {
      var postData = {
        'partnerOrgName': data.name,
        'partnerAdminEmail': data.email,
        'partnerType': data.type,
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
