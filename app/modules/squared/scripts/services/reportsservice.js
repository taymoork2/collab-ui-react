'use strict';

angular.module('Squared')
  .service('ReportsService', ['$http', '$rootScope', '$location', 'Storage', 'Config', 'Log', 'Authinfo', 'Auth',
    function ($http, $rootScope, $location, Storage, Config, Log, Authinfo, Auth) {

      var apiUrl = Config.getAdminServiceUrl() + 'organization/' + Authinfo.getOrgId() + '/';

      var callMetricsUrl = apiUrl + 'reports/stats/callUsage';
      var activeUsersUrl = apiUrl + 'reports/counts/activeUsers';
      var callsUrl = apiUrl + 'reports/counts/calls';
      var conversationsUrl = apiUrl + 'reports/counts/conversations';
      var timeChartUrl = apiUrl + 'reports/timeCharts/';
      var logInfoBaseUrl = apiUrl + 'reports/tables/calls/';

      var healthUrl = Config.getHealthCheckUrlServiceUrl();
      var averageCallCount = apiUrl + 'reports/counts/avgCallsPerUser';
      var entitlementCount = apiUrl + 'reports/counts/entitlements';
      var contentSharedCount = apiUrl + 'reports/counts/contentShared';
      var onboardingUrl = apiUrl + 'reports/funnel/onboarding';

      var urls = {
        'callUsage': callMetricsUrl,
        'activeUserCount': activeUsersUrl,
        'averageCallCount': averageCallCount,
        'entitlementCount': entitlementCount,
        'contentSharedCount': contentSharedCount,
        'callsCount': callsUrl,
        'conversationsCount': conversationsUrl,
        'onboardingFunnel': onboardingUrl
      };

      var buildUrl = function (metricType, params) {
        var metricUrl = '';
        if (urls[metricType]) {
          metricUrl = urls[metricType];
        } else {
          metricUrl = timeChartUrl + metricType;
        }

        if (params) {
          metricUrl += '?';
        }
        if (params.intervalCount) {
          metricUrl += '&intervalCount=' + params.intervalCount;
        }
        if (params.intervalType) {
          metricUrl += '&intervalType=' + params.intervalType;
        }
        if (params.spanCount) {
          metricUrl += '&spanCount=' + params.spanCount;
        }
        if (params.spanType) {
          metricUrl += '&spanType=' + params.spanType;
        }
        if (params.cache) {
          metricUrl += '&cache=' + params.cache;
        }
        if (params.isCustomerView) {
          metricUrl += '&isCustomerView=' + params.isCustomerView;
        }

        return metricUrl;
      };

      var sendChartResponse = function (data, status, metricType) {
        var response = {
          'data': data,
          'status': status
        };
        $rootScope.$broadcast(metricType + 'Loaded', response);
      };

      return {

        getUsageMetrics: function (metricType, params, callback) {
          $http.defaults.headers.common.Authorization = 'Bearer ' + $rootScope.token;

          var metricUrl = buildUrl(metricType, params);

          return $http.get(metricUrl)
            .success(function (data, status) {
              data.success = true;
              Log.debug('Callback for ' + metricType + ' for org=' + Authinfo.getOrgId());
              sendChartResponse(data, status, metricType);
            })
            .error(function (data, status) {
              data.success = false;
              data.status = status;
              data.errorMsg = data;
              sendChartResponse(data, status, metricType);
              Auth.handleStatus(status);
            });
        },

        getPartnerMetrics: function (useCache) {
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
            'cache': useCache,
            'isCustomerView': false
          };

          var partnerCharts = ['activeUsers', 'avgCallsPerUser', 'entitlements', 'contentShared',
            'contentShareSizes', 'activeUserCount', 'averageCallCount', 'entitlementCount', 'contentSharedCount',
            'convOneOnOne', 'convGroup', 'calls', 'callsAvgDuration', 'avgConversations', 'onboardingFunnel'
          ];

          for (var chart in partnerCharts) {
            this.getUsageMetrics(partnerCharts[chart], chartParams);
          }

          chartParams = {
            'cache': useCache
          };

          var funnelCharts = ['onboardingFunnel'];

          for (chart in funnelCharts) {
            this.getUsageMetrics(funnelCharts[chart], chartParams);
          }

        },

        getAllMetrics: function (useCache) {
          var params = {
            'intervalCount': 1,
            'intervalType': 'month',
            'cache': useCache,
            'isCustomerView': true
          };

          var customerCounts = ['callsCount', 'conversationsCount', 'contentSharedCount'];
          for (var chart in customerCounts) {
            this.getUsageMetrics(customerCounts[chart], params);
          }

          params = {
            'intervalCount': 1,
            'intervalType': 'month',
            'spanCount': 1,
            'spanType': 'week',
            'cache': useCache,
            'isCustomerView': true
          };

          var customerCharts = ['calls', 'conversations', 'contentShareSizes', 'contentShared',
            'activeUsers', 'entitlements', 'avgCallsPerUser', 'avgConversations', 'convOneOnOne', 'convGroup',
            'calls', 'callsAvgDuration'
          ];

          for (chart in customerCharts) {
            this.getUsageMetrics(customerCharts[chart], params);
          }

          params = {
            'cache': useCache
          };

          var funnelCharts = ['onboardingFunnel'];

          for (chart in funnelCharts) {
            this.getUsageMetrics(funnelCharts[chart], params);
          }
        },

        getLogInfo: function (locusId, startTime, callback) {
          var logInfoUrl = logInfoBaseUrl + locusId + '?locusCallStartTime=' + startTime;

          $http.defaults.headers.common.Authorization = 'Bearer ' + $rootScope.token;
          $http.get(logInfoUrl)
            .success(function (data, status) {
              data.success = true;
              Log.debug('Retrieved call info for : ' + locusId + ' startTime : ' + startTime);
              callback(data, status);
            })
            .error(function (data, status) {
              data.success = false;
              data.status = status;
              callback(data, status);
              Auth.handleStatus(status);
            });
        },

        healthMonitor: function (callback) {
          $http.get(healthUrl)
            .success(function (data, status) {
              data.success = true;
              Log.debug('Callback for healthMonitor');
              callback(data, status);
            })
            .error(function (data, status) {
              callback(data, status);
            });
        }

      };
    }
  ]);
