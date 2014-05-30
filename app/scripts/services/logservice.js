'use strict';

angular.module('wx2AdminWebClientApp')
  .service('LogService', ['$http', 'Storage', 'Config', 'Log',
    function($http, Storage, Config, Log) {

      var token = Storage.get('accessToken');

      return {
        listLogs: function(userId, callback) {
          var logsUrl = Config.getAdminServiceUrl() + 'logs/' + userId;

          $http.defaults.headers.common.Authorization = 'Bearer ' + token;
          $http.get(logsUrl)
            .success(function(data, status) {
              data.success = true;
              Log.debug('Retrieved logs for user: ' + userId);
              callback(data, status);
            })
            .error(function(data, status) {
              data.success = false;
              data.status = status;
              callback(data, status);
            });
        }
      };
    }
  ]);
