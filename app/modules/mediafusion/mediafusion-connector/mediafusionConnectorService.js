(function () {
  'use strict';

  angular.module('Mediafusion')
    .service('MediafusionClusterService', MediafusionClusterService);

  /* @ngInject */
  function MediafusionClusterService($http, $q, $location, mock, converter, MediafusionConfigService, notification, Authinfo) {
    var lastClusterResponse = [];

    function extractDataFromResponse(res) {
      return res.data;
    }

    var fetch = function (callback) {
      var searchObject = $location.search();
      var backend = searchObject['hercules-backend'];
      if (angular.isDefined(backend) && backend === 'mock') {
        return callback(null, converter.convertClusters(mock.mockData()));
      }
      if (angular.isDefined(backend) && backend === 'nodata') {
        return callback(null, []);
      }

      /*var errorCallback = (function () {
        if (opts && opts.squelchErrors) {
          return function () {
            callback(arguments);
          };
        } else {
          return createErrorHandler('Unable to fetch data from backend', callback);
        }
      }());*/

      $http
        .get(MediafusionConfigService.getUrl() + '/organizations/' + Authinfo.getOrgId() + '/clusters')
        .success(function (data) {
          var converted = converter.convertClusters(data);
          lastClusterResponse = converted;
          callback(null, converted);
        });
      //.error(errorCallback);

      return lastClusterResponse;
    };

    var upgradeSoftware = function (clusterId, serviceType, callback, opts) {
      var url = MediafusionConfigService.getUrl() + '/organizations/' + Authinfo.getOrgId() + '/clusters/' + clusterId + '/services/' + serviceType + '/upgrade';

      var errorCallback = (function () {
        if (opts && opts.squelchErrors) {
          return function () {
            callback(arguments);
          };
        } else {
          return createErrorHandler('Unable to upgrade software', callback);
        }
      }());

      $http
        .post(url, '{}')
        .success(createSuccessCallback(callback))
        .error(errorCallback);
    };

    var defuseConnector = function (clusterId, callback) {
      var url = MediafusionConfigService.getUrl() + '/organizations/' + Authinfo.getOrgId() + '/clusters/' + clusterId;
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
        notification.notify(message, arguments);
        callback(arguments);
      };
    }

    var getGroups = function () {
      var url = MediafusionConfigService.getUrl() + '/organizations/' + Authinfo.getOrgId() + '/property_sets' + '?' + 'type=' + 'mf.group';
      return $http.get(url).then(extractDataFromResponse);
    };

    var updateGroupAssignment = function (clusterId, propertySetId) {
      var clusterAssignedPropertySet = {
        'property_set_id': propertySetId
      };

      var url = MediafusionConfigService.getUrl() + '/organizations/' + Authinfo.getOrgId() + '/clusters/' + clusterId + '/assigned_property_sets';
      return $http.post(url, clusterAssignedPropertySet);
    };

    var removeGroupAssignment = function (clusterId, propertySetId) {
      var url = MediafusionConfigService.getUrl() + '/organizations/' + Authinfo.getOrgId() + '/clusters/' + clusterId + '/assigned_property_sets/' + propertySetId;
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

      var url = MediafusionConfigService.getUrl() + '/organizations/' + Authinfo.getOrgId() + '/property_sets';
      return $http
        .post(url, grp);
      //.success(callback);
    };

    var changeRole = function (role, clusterId) {
      var grp = {
        'mf.role': role
      };

      var url = MediafusionConfigService.getUrl() + '/organizations/' + Authinfo.getOrgId() + '/clusters/' + clusterId + '/properties';
      return $http
        .post(url, grp);
      //.success(callback);
    };

    return {
      fetch: fetch,
      defuseConnector: defuseConnector,
      upgradeSoftware: upgradeSoftware,
      getGroups: getGroups,
      updateGroupAssignment: updateGroupAssignment,
      removeGroupAssignment: removeGroupAssignment,
      createGroup: createGroup,
      changeRole: changeRole
    };
  }
})();
