'use strict';

/* global _ */

var getUrl = function () {
  var key = "hercules-url";
  var regex = new RegExp(key + "=([^&]*)");
  var match = window.location.search.match(regex);
  if (match && match.length == 2) {
    return decodeURIComponent(match[1]);
  } else {
    return 'https://hercules.hitest.huron-dev.com/v1/clusters';
  }
};

angular.module('Hercules')
  .service('ConnectorService', ['$http', 'ConnectorMock', 'ConverterService', 'Notification',
    function ConnectorService($http, mock, converter, notification) {
      var lastClusterResponse = [];

      var fetch = function (callback) {
        if (window.location.search.match(/hercules-backend=error/)) {
          console.info('hercules backend will return error');
          getUrl = function () {
            return 'https://hercules.hitest.huron-dev.com/fubar';
          };
        }
        if (window.location.search.match(/hercules-backend=mock/)) {
          console.info('hercules backend will return mock data');
          return callback(null, converter.convertClusters(mock.mockData()));
        }
        $http
          .get(getUrl())
          .success(function (data) {
            var converted = converter.convertClusters(data);
            lastClusterResponse = converted;
            callback(null, converted);
          })
          .error(createErrorHandler('Unable to fetch data from UC fusion backend'), callback);
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
          .error(createErrorHandler('Unable to upgrade software'), opts.callback);
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
        upgradeSoftware: upgradeSoftware
      };
    }
  ]);
