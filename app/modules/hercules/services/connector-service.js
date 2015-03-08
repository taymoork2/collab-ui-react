'use strict';

/* global _ */

angular.module('Hercules')
  .service('ConnectorService', ['$http', '$window', 'ConnectorMock', 'ConverterService', 'ConfigService', 'XhrNotificationService',
    function ConnectorService($http, $window, mock, converter, config, notification) {
      var lastClusterResponse = [];

      var fetch = function (callback, opts) {
        if ($window.location.search.match(/hercules-backend=mock/)) {
          return callback(null, converter.convertClusters(mock.mockData()));
        }
        if ($window.location.search.match(/hercules-backend=nodata/)) {
          return callback(null, []);
        }

        var errorCallback = (function () {
          if (opts && opts.squelchErrors) {
            return function () {
              callback(arguments);
            };
          } else {
            return createErrorHandler('Unable to fetch data from UC fusion backend', callback);
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

      var upgradeSoftware = function (clusterId, serviceType, callback) {
        var url = config.getUrl() + '/clusters/' + clusterId + '/services/' + serviceType + '/upgrade';
        $http
          .post(url, '{}')
          .success(createSuccessCallback(callback))
          .error(createErrorHandler('Unable to upgrade software', callback));
      };

      var deleteHost = function (clusterId, serial, callback) {
        var url = config.getUrl() + '/clusters/' + clusterId + '/hosts/' + serial;
        $http
          .delete(url)
          .success(callback)
          .error(createErrorHandler('Unable to delete host', callback));
      };

      var createSuccessCallback = function (callback) {
        return function (data) {
          callback(null, data);
        };
      };

      var createErrorHandler = function (message, callback) {
        return function (data, status, headers, config) {
          notification.notify(message, arguments);
          callback(arguments);
        };
      };

      return {
        fetch: fetch,
        deleteHost: deleteHost,
        upgradeSoftware: upgradeSoftware
      };
    }
  ]);
