'use strict';

angular.module('Hercules')
  .service('ConnectorService', ['$http', '$location', 'ConnectorMock', 'ConverterService', 'ConfigService', 'XhrNotificationService',
    function ConnectorService($http, $location, mock, converter, config, notification) {
      var lastClusterResponse = [];

      var fetch = function (callback, opts) {
        if ($location.absUrl().match(/hercules-backend=mock/)) {
          return callback(null, converter.convertClusters(mock.mockData()));
        }
        if ($location.absUrl().match(/hercules-backend=nodata/)) {
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

      var getConnector = function (connectorId, callback) {
        var url = config.getUrl() + '/connectors/' + connectorId;
        $http
          .get(url)
          .success(function (data) {
            callback(null, data);
          })
          .error(createErrorHandler('Unable to read connector', callback));
      };

      var createSuccessCallback = function (callback) {
        return function (data) {
          callback(null, data);
        };
      };

      var createErrorHandler = function (message, callback) {
        return function () {
          notification.notify(message, arguments);
          callback(arguments);
        };
      };

      return {
        fetch: fetch,
        deleteHost: deleteHost,
        upgradeSoftware: upgradeSoftware,
        getConnector: getConnector
      };
    }
  ]);
