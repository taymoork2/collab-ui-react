(function () {
  'use strict';

  angular
    .module('Hercules')
    .factory('ResourceGroupService', ResourceGroupService);

  /* @ngInject */
  function ResourceGroupService($http, $translate, Authinfo, FusionClusterService, UrlConfig) {
    var service = {
      getAll: getAll,
      get: get,
      create: create,
      remove: remove,
      getAllowedChannels: getAllowedChannels,
      setName: setName,
      setReleaseChannel: setReleaseChannel,
      assign: assign,
      getAllAsOptions: getAllAsOptions,
      resourceGroupHasEligibleCluster: resourceGroupHasEligibleCluster
    };

    return service;

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
      return $http
        .get(UrlConfig.getHerculesUrlV2() + '/organizations/' + Authinfo.getOrgId() + '/releaseChannels')
        .then(extractDataFromResponse)
        .then(function (data) {
          var allowedChannels = [];
          _.forEach(data.releaseChannels, function (channel) {
            if (channel.entitled === true) {
              allowedChannels.push(channel.channel);
            }
          });
          return allowedChannels;
        });
    }

    function assign(clusterId, resourceGroupId) {
      return $http.patch(UrlConfig.getHerculesUrlV2() + '/organizations/' + Authinfo.getOrgId() + '/clusters/' + clusterId, { resourceGroupId: resourceGroupId })
        .then(extractDataFromResponse);
    }

    function getAllAsOptions(orgId) {
      return getAll(orgId).then(function (groups) {
        var options = [];
        if (groups && groups.length > 0) {
          _.each(groups, function (group) {
            options.push({
              label: group.name + (group.releaseChannel ? ' (' + $translate.instant('hercules.fusion.add-resource-group.release-channel.' + group.releaseChannel) + ')' : ''),
              value: group.id
            });
          });
        }
        return options;
      });
    }

    function resourceGroupHasEligibleCluster(resourceGroupId, connectorType) {
      return FusionClusterService.getAll()
        .then(function (clusters) {
          var clustersInGroup;
          if (resourceGroupId !== '') {
            clustersInGroup = FusionClusterService.getClustersForResourceGroup(resourceGroupId, clusters);
          } else {
            clustersInGroup = FusionClusterService.getUnassignedClusters(clusters);
          }

          // No clusters in group: obviously not going to work
          if (clustersInGroup.length === 0) {
            return false;
          }

          return _.some(clustersInGroup, function (cluster) {
            return _.some(cluster.connectors, function (connector) {
              return connector.connectorType === connectorType;
            });
          });
        });
    }

    function extractDataFromResponse(res) {
      return res.data;
    }

    function extractGroupsFromResponse(res) {
      return extractDataFromResponse(res).items;
    }
  }
})();
