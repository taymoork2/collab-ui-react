(function () {
  'use strict';

  angular
    .module('Hercules')
    .service('UCCService', UCCService);

  /* @ngInject */
  function UCCService($http, UrlConfig, Authinfo) {
    var uccUrl = UrlConfig.getUccUrl();
    return {
      getUserDiscovery: getUserDiscovery
    };

    function extractData(res) {
      return res.data;
    }

    function getUserDiscovery(userId, orgId) {
      return $http
        .get(uccUrl + '/userDiscovery/' + (orgId || Authinfo.getOrgId()) + '/' + userId)
        .then(extractData);
    }
  }
}());
