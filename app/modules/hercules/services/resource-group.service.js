(function () {
  'use strict';

  angular
    .module('Hercules')
    .factory('ResourceGroupService', ResourceGroupService);

  /* @ngInject */
  function ResourceGroupService($http, UrlConfig, Authinfo) {
    return {
      getAll: getAll,
      get: get,
      create: create
    };

    function get(resourceGroupId, orgId) {
      return $http
        .get(UrlConfig.getHerculesUrlV2() + '/organizations/' + (orgId || Authinfo.getOrgId()) + '/resourceGroups/' + resourceGroupId)
        .then(extractDataFromResponse);
    }

    function getAll(orgId) {
      return $http
        .get(UrlConfig.getHerculesUrlV2() + '/organizations/' + (orgId || Authinfo.getOrgId()) + '/resourceGroups')
        .then(extractGroupsFromResponse);
    }

    function create(name, releaseChannel) {
      return $http
        .post(UrlConfig.getHerculesUrlV2() + '/organizations/' + Authinfo.getOrgId() + '/resourceGroups', {
          name: name,
          releaseChannel: releaseChannel
        })
        .then(extractDataFromResponse);
    }

    function extractDataFromResponse(res) {
      return res.data;
    }

    function extractGroupsFromResponse(res) {
      return extractDataFromResponse(res).items;
    }
  }
})();
