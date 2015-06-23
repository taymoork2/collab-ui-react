'use strict';

angular.module('Squared')
  .service('CallflowService', ['$rootScope', '$http', 'Storage', 'Config', 'Log', 'Auth',
    function ($rootScope, $http, Storage, Config, Log, Auth) {

      return {
        getCallflowCharts: function (orgId, userId, locusId, callStart, logfileFullName, isGetCallLogs, callback) {
          var callflowChartsUrl = Config.getCallflowServiceUrl();

          if (isGetCallLogs === true) {
            callflowChartsUrl += 'callflow/logs?orgId=' + orgId + '&userId=' + userId + '&logfileFullName=' + logfileFullName;
          } else {
            callflowChartsUrl += 'callflow/tool/run?orgId=' + orgId + '&userId=' + userId + '&logfileFullName=' + logfileFullName;
          }

          if (locusId !== '-NA-') {
            callflowChartsUrl += '&locusid=' + locusId;
          }
          if (callStart !== '-NA-') {
            callflowChartsUrl += '&start_ts=' + callStart;
          }

          $http.get(callflowChartsUrl)
            .success(function (data, status) {
              data = data || {};
              data.success = true;
              Log.debug('Retrieved callflow charts corresponding to client logs: ' + data.resultsUrl);
              callback(data, status);
            })
            .error(function (data, status) {
              callback(data, status);
            });
        }
      };
    }
  ]);
