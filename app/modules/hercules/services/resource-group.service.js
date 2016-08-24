(function () {
  'use strict';

  angular
    .module('Hercules')
    .factory('ResourceGroupService', ResourceGroupService);

  /* @ngInject */
  function ResourceGroupService($http, UrlConfig, Authinfo) {
    return {
      getAll: getAll,
      get: get
    };

    function get(resourceGroupId, orgId) {
      return $http
        .get(UrlConfig.getHerculesUrlV2() + '/organizations/' + (orgId || Authinfo.getOrgId()) + '/resourceGroups/' + resourceGroupId)
        .then(extractDataFromResponse);
    }

    function getAll(orgId) {
      return $http
        .get(UrlConfig.getHerculesUrlV2() + '/organizations/' + (orgId || Authinfo.getOrgId()) + '/resourceGroups')
        .then(extractDataFromResponse);
    }

    function extractDataFromResponse(res) {
      return res.data;
    }
  }
})();
