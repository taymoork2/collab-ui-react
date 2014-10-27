'use strict';

angular.module('Squared')
  .service('CallflowService', ['$http', 'Storage', 'Config', 'Log', 'Auth',
    function($http, Storage, Config, Log, Auth) {

      var token = Storage.get('accessToken');

      return {
        getCallflowCharts: function(orgId, userId, logfileFullName, callback) {
          var callflowChartsUrl = Config.getCallflowServiceUrl() + 'callflow/tool/run?orgId=' + orgId + '&userId=' + userId +
          '&logfileFullName=' + logfileFullName;

          $http.defaults.headers.common.Authorization = 'Bearer ' + token;
          $http.get(callflowChartsUrl)
            .success(function(data, status) {
              data.success = true;
              Log.debug('Retrieved callflow charts corresponding to client logs: ' + data.resultsUrl);
              callback(data, status);
            })
            .error(function(data, status) {
              data.success = false;
              data.status = status;
              callback(data, status);
              Auth.handleStatus(status);
            });
        }
      };
    }
  ]);
