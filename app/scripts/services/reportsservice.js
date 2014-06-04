'use strict';

angular.module('wx2AdminWebClientApp')
  .service('ReportsService', ['$http', '$location', 'Storage', 'Config', 'Log', 'Authinfo',
    function($http, $location, Storage, Config, Log, Authinfo) {

      var token = Storage.get('accessToken');
      var callMetricsUrl = Config.getAdminServiceUrl() + 'reports/callUsage/';

      return {

        callUsageMetrics: function(callback) {
          var cmUrl = callMetricsUrl + Authinfo.getOrgId();

          $http.defaults.headers.common.Authorization = 'Bearer ' + token;
          $http.get(cmUrl)
            .success(function(data, status) {
              data.success = true;
              Log.debug('Callback for call metrics for org=' + Authinfo.getOrgId());
              callback(data, status);
            })
            .error(function(data, status) {
              data.success = false;
              data.status = status;
              data.errorMsg = data;
              callback(data, status);
            });

        }
      };
    }
  ]);
