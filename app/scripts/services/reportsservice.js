'use strict';

angular.module('wx2AdminWebClientApp')
  .service('ReportsService', ['$http', '$location', 'Storage', 'Config', 'Log', 'Authinfo',
    function($http, $location, Storage, Config, Log, Authinfo) {

      var token = Storage.get('accessToken');
      var callMetricsUrl = Config.getAdminServiceUrl() + 'reports/stats/callUsage';
      var activeUsersUrl = Config.getAdminServiceUrl() + 'reports/counts/activeUsers';
      var timeChartUrl = Config.getAdminServiceUrl() + 'reports/timeCharts/';

      var urls = {
        'callUsage':callMetricsUrl,
        'activeUserCount':activeUsersUrl
      };

      var buildUrl = function(metricType, params) {
        var metricUrl = '';
        if (urls[metricType])
        {
          metricUrl = urls[metricType];
        }
        else
        {
          metricUrl = timeChartUrl + metricType;
        }

        if (params)
        {
          metricUrl += '?';
        }
        if (params.intervalCount)
        {
          metricUrl += '&intervalCount=' + params.intervalCount;
        }
        if (params.intervalType)
        {
          metricUrl += '&intervalType=' + params.intervalType;
        }
        if (params.spanCount)
        {
          metricUrl += '&spanCount=' + params.spanCount;
        }
        if (params.spanType)
        {
          metricUrl += '&spanType=' + params.spanType;
        }

        return metricUrl;
      };

      return {

        getUsageMetrics: function(metricType, params, callback) {
          $http.defaults.headers.common.Authorization = 'Bearer ' + token;
          
          var metricUrl = buildUrl(metricType, params);
           
          $http.get(metricUrl)
            .success(function(data, status) {
              data.success = true;
              Log.debug('Callback for ' + metricType + ' for org=' + Authinfo.getOrgId());
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
