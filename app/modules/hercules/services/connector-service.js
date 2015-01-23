'use strict';

/* global _ */

angular.module('Hercules')
  .service('ConnectorService', ['$http', '$window', 'ConnectorMock', 'ConverterService', 'Notification',
    function ConnectorService($http, $window, mock, converter, notification) {
      var lastClusterResponse = [];

      var getUrl = function () {
        var regex = new RegExp("hercules-url=([^&]*)");
        var match = $window.location.search.match(regex);
        if (match && match.length == 2) {
          return decodeURIComponent(match[1]);
        } else {
          return 'https://hercules.hitest.huron-dev.com/v1/clusters';
        }
      };

      var fetch = function (callback, opts) {
        if ($window.location.search.match(/hercules-backend=error/)) {
          getUrl = function () {
            return 'https://hercules.hitest.huron-dev.com/fubar';
          };
        }
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
            }
            return callback;
          } else {
            return createErrorHandler('Unable to fetch data from UC fusion backend', callback);
          }
        }());

        $http
          .get(getUrl())
          .success(function (data) {
            var converted = converter.convertClusters(data);
            lastClusterResponse = converted;
            callback(null, converted);
          })
          .error(errorCallback);

        return lastClusterResponse;
      };

      var upgradeSoftware = function (opts) {
        var url = getUrl() + '/' + opts.clusterId + '/services/' + opts.serviceType + '/upgrade';
        var data = JSON.stringify({
          tlp: opts.tlpUrl
        });
        $http
          .post(url, data)
          .success(opts.callback)
          .error(createErrorHandler('Unable to upgrade software', opts.callback));
      };

      var deleteHost = function (clusterId, serial, callback) {
        var url = getUrl() + '/' + clusterId + '/hosts/' + serial;
        $http
          .delete(url)
          .success(callback)
          .error(createErrorHandler('Unable to delete host', callback));
      };

      var createErrorHandler = function (message, callback) {
        var messages = [message];
        return function (data, status, headers, config) {
          messages.push('Request failed with status ' + status);
          messages.push('Check the browser console for details');
          notification.notify(messages, 'error');
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
