(function () {
  'use strict';

  /* @ngInject */
  function MediaClusterService($q, $http, $location, $log, CsdmPoller, CsdmCacheUpdater, MediaConnectorMock, MediaConverterService, MediaConfigService, Authinfo, CsdmHubFactory, Notification, Config, UrlConfig) {
    var clusterCache = {};

    function extractDataFromResponse(res) {
      return res.data;
    }

    var fetch = function () {
      if ($location.absUrl().match(/mediaservice-backend=mock/)) {
        var data = MediaConverterService.convertClusters(MediaConnectorMock.mockData());
        var defer = $q.defer();
        defer.resolve(data);
        CsdmCacheUpdater.update(clusterCache, data);
        return defer.promise;
      }

      if ($location.absUrl().match(/mediaservice-backend=nodata/)) {
        var defer2 = $q.defer();
        defer2.resolve([]);
        return defer2.promise;
      }

      return $http
        .get(MediaConfigService.getUrl() + '/organizations/' + Authinfo.getOrgId() + '/clusters')
        .then(extractDataFromResponse)
        .then(MediaConverterService.convertClusters)
        .then(_.partial(CsdmCacheUpdater.update, clusterCache));
    };

    var getClusters = function () {
      return clusterCache;
    };

    var getAggegatedClusters = function (clusters, groupList) {
      $log.log("In getAggregatedClusters");
      //$log.log("clusterCache : ", clusterCache);
      return MediaConverterService.aggregateClusters(clusters, groupList);
    };

    var setProperty = function (clusterId, property, value) {
      var url = MediaConfigService.getUrl() + '/organizations/' + Authinfo.getOrgId() + '/clusters/' + clusterId + '/properties';
      var payload = {};
      payload[property] = value;
      return $http.post(url, payload);
    };

    var deleteCluster = function (clusterId) {
      var url = MediaConfigService.getUrl() + '/organizations/' + Authinfo.getOrgId() + '/clusters/' + clusterId;
      return $http.delete(url).then(function () {
        if (clusterCache[clusterId]) {
          delete clusterCache[clusterId];
        }
      });
    };

    var deleteHost = function (clusterId, serial) {
      var url = MediaConfigService.getUrl() + '/organizations/' + Authinfo.getOrgId() + '/clusters/' + clusterId + '/hosts/' + serial;
      return $http.delete(url).then(function () {
        var cluster = clusterCache[clusterId];
        if (cluster && cluster.hosts) {
          _.remove(cluster.hosts, {
            serial: serial
          });
          if (cluster.hosts.length === 0) {
            delete clusterCache[clusterId];
          }
        }
      });
    };

    var getConnector = function (connectorId) {
      var url = MediaConfigService.getUrl() + '/organizations/' + Authinfo.getOrgId() + '/connectors/' + connectorId;
      return $http.get(url).then(extractDataFromResponse);
    };

    var defuseConnector = function (clusterId, callback) {
      var url = MediaConfigService.getUrl() + '/organizations/' + Authinfo.getOrgId() + '/clusters/' + clusterId;
      $http
        .delete(url)
        .success(callback)
        .error(createErrorHandler('Unable to defuse', callback));
    };

    function createSuccessCallback(callback) {
      return function (data) {
        callback(null, data);
      };
    }

    function createErrorHandler(message, callback) {
      return function () {
        Notification.notify(message, arguments);
        callback(arguments);
      };
    }

    var getGroups = function () {
      var url = MediaConfigService.getUrl() + '/organizations/' + Authinfo.getOrgId() + '/property_sets' + '?' + 'type=' + 'mf.group';
      return $http.get(url).then(extractDataFromResponse);
    };

    var updateGroupAssignment = function (clusterId, propertySetId) {
      var clusterAssignedPropertySet = {
        'property_set_id': propertySetId
      };

      var url = MediaConfigService.getUrl() + '/organizations/' + Authinfo.getOrgId() + '/clusters/' + clusterId + '/assigned_property_sets';
      return $http.post(url, clusterAssignedPropertySet);
    };

    var removeGroupAssignment = function (clusterId, propertySetId) {
      var url = MediaConfigService.getUrl() + '/organizations/' + Authinfo.getOrgId() + '/clusters/' + clusterId + '/assigned_property_sets/' + propertySetId;
      return $http.delete(url);
    };

    var createGroup = function (groupName) {
      var grp = {
        'orgId': Authinfo.getOrgId(),
        'type': 'mf.group',
        'name': groupName,
        'properties': {
          'mf.group.displayName': groupName,
        }
      };

      var url = MediaConfigService.getUrl() + '/organizations/' + Authinfo.getOrgId() + '/property_sets';
      return $http
        .post(url, grp);
      //.success(callback);
    };

    var deleteGroup = function (propertySetId) {
      var url = MediaConfigService.getUrl() + '/organizations/' + Authinfo.getOrgId() + '/property_sets/' + propertySetId;
      return $http.delete(url);
    };

    var changeRole = function (role, clusterId) {
      var grp = {
        'mf.role': role
      };

      var url = MediaConfigService.getUrl() + '/organizations/' + Authinfo.getOrgId() + '/clusters/' + clusterId + '/properties';
      return $http
        .post(url, grp);
      //.success(callback);
    };

    var getPropertySet = function (propertySet) {
      var url = MediaConfigService.getUrl() + '/organizations/' + Authinfo.getOrgId() + '/property_sets/' + propertySet;
      return $http.get(url).then(extractDataFromResponse);
    };

    var setPropertySet = function (propertySet, value) {
      var url = MediaConfigService.getUrl() + '/organizations/' + Authinfo.getOrgId() + '/property_sets/' + propertySet;
      return $http.post(url, value);
    };

    var getOrganization = function (callback) {
      var url = UrlConfig.getAdminServiceUrl() + 'organizations/' + Authinfo.getOrgId();

      $http.get(url)
        .success(function (data, status) {
          data = data || {};
          data.success = true;
          callback(data, status);
        })
        .error(function (data, status) {
          if (!data || !(data instanceof Object)) {
            data = {};
          }
          data.success = false;
          data.status = status;
          callback(data, status);
        });

      //return $http.get(url).then(extractDataFromResponse);
    };

    var hub = CsdmHubFactory.create();
    var clusterPoller = CsdmPoller.create(fetch, hub);

    return {
      fetch: fetch,
      deleteHost: deleteHost,
      getClusters: getClusters,
      getConnector: getConnector,
      deleteCluster: deleteCluster,
      setProperty: setProperty,
      defuseConnector: defuseConnector,
      getGroups: getGroups,
      updateGroupAssignment: updateGroupAssignment,
      removeGroupAssignment: removeGroupAssignment,
      createGroup: createGroup,
      deleteGroup: deleteGroup,
      changeRole: changeRole,
      subscribe: hub.on,
      getAggegatedClusters: getAggegatedClusters,
      getPropertySet: getPropertySet,
      setPropertySet: setPropertySet,
      getOrganization: getOrganization
    };
  }

  angular
    .module('Mediafusion')
    .service('MediaClusterService', MediaClusterService);

}());
