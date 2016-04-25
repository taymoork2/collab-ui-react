(function() {
  'use strict';

  angular.module('Squared')
    .service('LogService', LogService);

  /* @ngInject */
  function LogService($rootScope, $http, Storage, UrlConfig, Log, Auth, $window) {
    var service = {
      listLogs: listLogs,
      searchLogs: searchLogs,
      downloadLog: downloadLog
    };

    return service;

    function listLogs(userId, callback) {
      var logsUrl = UrlConfig.getAdminServiceUrl() + 'logs/' + userId;

      $http.get(logsUrl)
        .success(function (data, status) {
          data = data || {};
          data.success = true;
          Log.debug('Retrieved logs for user: ' + userId);
          callback(data, status);
        })
        .error(function (data, status) {
          //data = data || {};
          // data.success = false;
          // data.status = status;
          callback(data, status);
        });
    }

    function searchLogs(searchInput, callback) {
      var logsUrl = UrlConfig.getAdminServiceUrl() + 'logs?search=' + $window.encodeURIComponent(searchInput);

      $http.get(logsUrl)
        .success(function (data, status) {
          data = data || {};
          data.success = true;
          Log.debug('Retrieved logs for search term: ' + searchInput);
          callback(data, status);
        })
        .error(function (data, status) {
          callback(data, status);
        });
    }

    function downloadLog(filename, callback) {
      var logsUrl = UrlConfig.getAdminServiceUrl() + 'logs/';
      var payload = {
        file: filename
      };

      $http.post(logsUrl, payload)
        .success(function (data, status) {
          data = data || {};
          data.success = true;
          Log.debug('Retrieved tempURL for log: ' + filename);
          callback(data, status);
        })
        .error(function (data, status) {
          callback(data, status);
        });
    }
  }
})();