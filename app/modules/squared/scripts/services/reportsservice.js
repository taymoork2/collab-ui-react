'use strict';

angular.module('Squared')
  .service('ReportsService', ['$http', '$rootScope', '$location', 'Storage', 'Config', 'Log', 'Authinfo', 'Auth',
    function($http, $rootScope, $location, Storage, Config, Log, Authinfo, Auth) {

      var token = Storage.get('accessToken');
      var callMetricsUrl = Config.getAdminServiceUrl() + 'reports/stats/callUsage';
      var activeUsersUrl = Config.getAdminServiceUrl() + 'reports/counts/activeUsers';
      var timeChartUrl = Config.getAdminServiceUrl() + 'reports/timeCharts/';
      var logInfoBaseUrl = Config.getAdminServiceUrl() + 'reports/tables/calls/';
      var healthUrl = Config.getHealthCheckUrlServiceUrl();
      var averageCallCount = Config.getAdminServiceUrl() + 'reports/counts/avgCallsPerUser';
      var entitlementCount = Config.getAdminServiceUrl() + 'reports/counts/entitlements';
      var contentSharedCount = Config.getAdminServiceUrl() + 'reports/counts/contentShared';


      var urls = {
        'callUsage':callMetricsUrl,
        'activeUserCount':activeUsersUrl,
        'averageCallCount':averageCallCount,
        'entitlementCount':entitlementCount,
        'contentSharedCount':contentSharedCount
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
        if (params.cache)
        {
          metricUrl += '&cache=' + params.cache;
        }

        return metricUrl;
      };

      return {

        getUsageMetrics: function(metricType, params, callback) {
          $http.defaults.headers.common.Authorization = 'Bearer ' + token;

          var metricUrl = buildUrl(metricType, params);

          return $http.get(metricUrl)
            .success(function(data, status) {
              data.success = true;
              Log.debug('Callback for ' + metricType + ' for org=' + Authinfo.getOrgId());
              if (angular.isFunction(callback)) {
                callback(data, status);
              }
            })
            .error(function(data, status) {
              data.success = false;
              data.status = status;
              data.errorMsg = data;
              if (angular.isFunction(callback)) {
                callback(data, status);
              }
              Auth.handleStatus(status);
            });
        },

        getPartnerMetrics: function(useCache) {
          var countParam = {
            'intervalCount': 1,
            'intervalType': 'week',
            'cache': useCache
          };
          var chartParams = {
            'intervalCount': 1,
            'intervalType': 'week',
            'spanCount': 1,
            'spanType': 'day',
            'cache': useCache
          };

          this.getUsageMetrics('activeUsers', chartParams, function(data,status){
            var response = {
              'data': data,
              'status': status
            };
            $rootScope.$broadcast('ActiveUsersLoaded', response);
          });

          this.getUsageMetrics('avgCallsPerUser', chartParams, function(data,status){
            var response = {
              'data': data,
              'status': status
            };
            $rootScope.$broadcast('AverageCallsLoaded', response);
          });

          this.getUsageMetrics('entitlements', chartParams, function(data,status){
            var response = {
              'data': data,
              'status': status
            };
            $rootScope.$broadcast('EntitlementsLoaded', response);
          });

          this.getUsageMetrics('contentShared', chartParams, function(data,status){
            var response = {
              'data': data,
              'status': status
            };
            $rootScope.$broadcast('ContentSharedLoaded', response);
          });

          this.getUsageMetrics('activeUserCount', chartParams, function(data,status){
            var response = {
              'data': data,
              'status': status
            };
            $rootScope.$broadcast('ActiveUserCountLoaded', response);
          });

          this.getUsageMetrics('averageCallCount', chartParams, function(data,status){
            var response = {
              'data': data,
              'status': status
            };
            $rootScope.$broadcast('AverageCallCountLoaded', response);
          });

          this.getUsageMetrics('entitlementCount', chartParams, function(data,status){
            var response = {
              'data': data,
              'status': status
            };
            $rootScope.$broadcast('EntitlementCountLoaded', response);
          });

          this.getUsageMetrics('contentSharedCount', chartParams, function(data,status){
            var response = {
              'data': data,
              'status': status
            };
            $rootScope.$broadcast('ContentSharedCountLoaded', response);
          });
        },

        getAllMetrics :function(useCache){
          var params = {
            'intervalCount': 1,
            'intervalType': 'month',
            'cache' : useCache
          };

          this.getUsageMetrics('activeUserCount', params, function(data, status) {
              var response = {
                'data': data,
                'status': status
              };
              $rootScope.$broadcast('ActiveUserCountLoaded', response);
            });

          params = {
            'intervalCount': 1,
            'intervalType': 'month',
            'spanCount': 1,
            'spanType': 'week',
            'cache' : useCache
          };

          this.getUsageMetrics('calls', params, function(data, status) {
              var response = {
                'data': data,
                'status': status
              };
              $rootScope.$broadcast('CallsLoaded', response);
            });

          this.getUsageMetrics('conversations', params, function(data, status) {
            var response = {
                'data': data,
                'status': status
              };
            $rootScope.$broadcast('ConvLoaded', response);
          });

          this.getUsageMetrics('contentShareSizes', params, function(data, status) {
            var response = {
                'data': data,
                'status': status
              };
            $rootScope.$broadcast('ContentShareLoaded', response);
          });

          this.getUsageMetrics('activeUsers', params, function(data, status) {
            var response = {
                'data': data,
                'status': status
              };
            $rootScope.$broadcast('ActiveUserMetricsLoaded', response);
          });

          this.getUsageMetrics('entitlements', params, function(data, status) {
            var response = {
                'data': data,
                'status': status
              };
            $rootScope.$broadcast('EntitlementsLoaded', response);
          });

          this.getUsageMetrics('avgCalls', params, function(data, status) {
            var response = {
                'data': data,
                'status': status
              };
            $rootScope.$broadcast('AvgCallsLoaded', response);
          });

          this.getUsageMetrics('avgConversations', params, function(data, status) {
            var response = {
                'data': data,
                'status': status
              };
            $rootScope.$broadcast('AvgConversationsLoaded', response);
          });
        },

        getLogInfo: function(locusId, startTime, callback) {
          var logInfoUrl = logInfoBaseUrl + locusId + '?locusCallStartTime=' + startTime;

          $http.defaults.headers.common.Authorization = 'Bearer ' + token;
          $http.get(logInfoUrl)
            .success(function(data, status) {
              data.success = true;
              Log.debug('Retrieved call info for : ' + locusId + ' startTime : ' + startTime);
              callback(data, status);
            })
            .error(function(data, status) {
              data.success = false;
              data.status = status;
              callback(data, status);
              Auth.handleStatus(status);
            });
        },

        healthMonitor: function(callback) {
          $http.get(healthUrl)
            .success(function(data, status) {
              data.success = true;
              Log.debug('Callback for healthMonitor');
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
