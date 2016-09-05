(function () {
  'use strict';

  angular
    .module('Hercules')
    .factory('ResourceGroupService', ResourceGroupService);

  /* @ngInject */
  function ResourceGroupService($http, UrlConfig, Authinfo, Orgservice, $q) {
    return {
      getAll: getAll,
      get: get,
      create: create,
      remove: remove,
      getAllowedChannels: getAllowedChannels,
      setName: setName,
      setReleaseChannel: setReleaseChannel,
      assign: assign
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

    function remove(resourceGroupId) {
      return $http.delete(UrlConfig.getHerculesUrlV2() + '/organizations/' + Authinfo.getOrgId() + '/resourceGroups/' + resourceGroupId);
    }

    function setName(resourceGroupId, name) {
      return $http
        .patch(UrlConfig.getHerculesUrlV2() + '/organizations/' + Authinfo.getOrgId() + '/resourceGroups/' + resourceGroupId, {
          name: name
        })
        .then(extractDataFromResponse);
    }

    function setReleaseChannel(resourceGroupId, channel) {
      return $http
        .patch(UrlConfig.getHerculesUrlV2() + '/organizations/' + Authinfo.getOrgId() + '/resourceGroups/' + resourceGroupId, {
          releaseChannel: channel
        })
        .then(extractDataFromResponse);
    }

    function getAllowedChannels() {
      var deferred = $q.defer();
      Orgservice.getOrgCacheOption(function (data, status) {
        if (data && data.success) {
          // TODO: look at the sub entitlements and only allow entitled channels
          deferred.resolve(['stable', 'beta', 'latest']);
        } else {
          deferred.reject(status);
        }
      }, null, {
        cache: true
      });
      return deferred.promise;
    }

    function assign(clusterId, resourceGroupId) {
      return $http.patch(UrlConfig.getHerculesUrlV2() + '/organizations/' + Authinfo.getOrgId() + '/clusters/' + clusterId, { resourceGroupId: resourceGroupId })
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
