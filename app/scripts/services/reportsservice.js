'use strict';

angular.module('wx2AdminWebClientApp')
  .service('ReportsService', ['$http', '$location', 'Storage', 'Config', 'Log', 'Authinfo',
    function($http, $location, Storage, Config, Log, Authinfo) {

      var token = Storage.get('accessToken');
      var callMetricsUrl = Config.getAdminServiceUrl() + 'reports/stats/callUsage?intervalCount=1&intervalType=month';
      var activeUsersUrl = Config.getAdminServiceUrl() + 'reports/counts/activeUsers?intervalCount=1&intervalType=month';
      var callsUrl = Config.getAdminServiceUrl() + 'reports/timeCharts/calls?spanCount=1&spanType=week&intervalCount=1&intervalType=month';
      var convoUrl = Config.getAdminServiceUrl() + 'reports/timeCharts/conversations?spanCount=1&spanType=week&intervalCount=1&intervalType=month';
      var cShareUrl = Config.getAdminServiceUrl() + 'reports/timeCharts/contentShareSizes?spanCount=1&spanType=week&intervalCount=1&intervalType=month';

      return {

        callUsageMetrics: function(callback) {
          $http.defaults.headers.common.Authorization = 'Bearer ' + token;
          $http.get(callMetricsUrl)
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
        },

        activeUsersCount: function(callback) {
          $http.defaults.headers.common.Authorization = 'Bearer ' + token;
          $http.get(activeUsersUrl)
            .success(function(data, status) {
              data.success = true;
              Log.debug('Callback for active users for org=' + Authinfo.getOrgId());
              callback(data, status);
            })
            .error(function(data, status) {
              data.success = false;
              data.status = status;
              data.errorMsg = data;
              callback(data, status);
            });
        },

        callMetrics: function(callback) {
          $http.defaults.headers.common.Authorization = 'Bearer ' + token;
          $http.get(callsUrl)
            .success(function(data, status) {
              data.success = true;
              Log.debug('Callback for calls for org=' + Authinfo.getOrgId());
              callback(data, status);
            })
            .error(function(data, status) {
              data.success = false;
              data.status = status;
              data.errorMsg = data;
              callback(data, status);
            });
        },

        conversationMetrics: function(callback) {
          $http.defaults.headers.common.Authorization = 'Bearer ' + token;
          $http.get(convoUrl)
            .success(function(data, status) {
              data.success = true;
              Log.debug('Callback for conversations for org=' + Authinfo.getOrgId());
              callback(data, status);
            })
            .error(function(data, status) {
              data.success = false;
              data.status = status;
              data.errorMsg = data;
              callback(data, status);
            });
        },

        contentShareMetrics: function(callback) {
          $http.defaults.headers.common.Authorization = 'Bearer ' + token;
          $http.get(cShareUrl)
            .success(function(data, status) {
              data.success = true;
              Log.debug('Callback for content share for org=' + Authinfo.getOrgId());
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
