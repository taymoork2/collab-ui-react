'use strict';

angular.module('Mediafusion')
  .service('MediafusionClusterService', ['$http', '$location', 'MediafusionConnectorMock', 'MediafusionConverterService', 'MediafusionConfigService', 'XhrNotificationService',
    function MediafusionClusterService($http, $location, mock, converter, config, notification) {
      var lastClusterResponse = [];

      var fetch = function (callback, opts) {
        var searchObject = $location.search();
        var backend = searchObject['hercules-backend'];
        if (angular.isDefined(backend) && backend === 'mock') {
          return callback(null, converter.convertClusters(mock.mockData()));
        }
        if (angular.isDefined(backend) && backend === 'nodata') {
          return callback(null, []);
        }

        var errorCallback = (function () {
          if (opts && opts.squelchErrors) {
            return function () {
              callback(arguments);
            };
          } else {
            return createErrorHandler('Unable to fetch data from backend', callback);
          }
        }());

        $http
          .get(config.getUrl() + '/clusters')
          .success(function (data) {
            var converted = converter.convertClusters(data);
            lastClusterResponse = converted;
            callback(null, converted);
          })
          .error(errorCallback);

        return lastClusterResponse;
      };

      var upgradeSoftware = function (clusterId, serviceType, callback, opts) {
        var url = config.getUrl() + '/clusters/' + clusterId + '/services/' + serviceType + '/upgrade';

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

      var deleteHost = function (clusterId, serial, callback) {
        var url = config.getUrl() + '/clusters/' + clusterId + '/hosts/' + serial;
        $http
          .delete(url)
          .success(callback)
          .error(createErrorHandler('Unable to delete host', callback));
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

      return {
        fetch: fetch,
        deleteHost: deleteHost,
        upgradeSoftware: upgradeSoftware
      };
    }
  ]);
