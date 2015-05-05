'use strict';

angular.module('Squared')
  .service('ReportsService', ['$http', '$rootScope', '$location', 'Storage', 'Config', 'Log', 'Authinfo', 'Auth',
    function ($http, $rootScope, $location, Storage, Config, Log, Authinfo, Auth) {

      var apiUrl = Config.getAdminServiceUrl() + 'organization/' + Authinfo.getOrgId() + '/';

      var callMetricsUrl = 'reports/stats/callUsage';
      var activeUsersUrl = 'reports/counts/activeUsers';
      var callsUrl = 'reports/counts/calls';
      var conversationsUrl = 'reports/counts/conversations';

      var timeChartUrl;

      var logInfoBaseUrl = 'reports/tables/calls/';
      var healthUrl = Config.getHealthCheckUrlServiceUrl();
      var averageCallCount = 'reports/counts/avgCallsPerUser';
      var entitlementCount = 'reports/counts/entitlements';
      var contentSharedCount = 'reports/counts/contentShared';
      var onboardingUrl = 'reports/funnel/onboarding';

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

        metricUrl = timeChartUrl;

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
        if (params.cache !== null) {
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
        getCounts: function (useCache) {
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
        },

        getTimeCharts: function (useCache, customerCharts) {
          var params = {
            'intervalCount': 1,
            'intervalType': 'month',
            'spanCount': 1,
            'spanType': 'week',
            'cache': useCache,
            'isCustomerView': true
          };

          for (var chart in customerCharts) {
            this.getUsageMetrics(customerCharts[chart], params);
          }
        },

        getFunnel: function (useCache) {
          var params = {
            'cache': useCache
          };

          var funnelCharts = ['onboardingFunnel'];

          for (var chart in funnelCharts) {
            this.getUsageMetrics(funnelCharts[chart], params);
          }
        },

        getUsageMetrics: function (metricType, params, orgId) {
          if (Authinfo.isPartner()) { // partner reports
            if (urls[metricType]) { // count metric type
              if (!orgId) { // count for all managed customers
                timeChartUrl = apiUrl + urls[metricType];
              } else { // count for specific managed customer
                timeChartUrl = Config.getAdminServiceUrl() + 'organization/' + orgId + '/' + urls[metricType];
              }
            } else { // timechart metric type
              if (!orgId) { // timechart for all managed customers
                timeChartUrl = apiUrl + 'reports/timeCharts/managedOrgs/' + metricType;
              } else { // timechart for specific managed customer
                timeChartUrl = Config.getAdminServiceUrl() + 'organization/' + orgId + '/' + 'reports/timeCharts/' + metricType;
              }
            }
          } else { // customer reports
            if (urls[metricType]) {
              timeChartUrl = apiUrl + urls[metricType];
            } else {
              timeChartUrl = apiUrl + 'reports/timeCharts/' + metricType;
            }
          }

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
            });
        },

        getPartnerMetrics: function (useCache, orgId) {
          var chartParams = {
            'intervalCount': 1,
            'intervalType': 'month',
            'spanCount': 1,
            'spanType': 'week',
            'cache': useCache,
            'isCustomerView': false
          };

          var partnerCharts = ['activeUsers', 'avgCallsPerUser', 'entitlements', 'contentShared',
            'contentShareSizes', 'activeUserCount', 'averageCallCount', 'entitlementCount', 'contentSharedCount',
            'convOneOnOne', 'convGroup', 'calls', 'callsAvgDuration', 'avgConversations', 'onboardingFunnel'
          ];

          for (var chart in partnerCharts) {
            this.getUsageMetrics(partnerCharts[chart], chartParams, orgId);
          }

          chartParams = {
            'cache': useCache
          };

          var funnelCharts = ['onboardingFunnel'];

          for (chart in funnelCharts) {
            this.getUsageMetrics(funnelCharts[chart], chartParams);
          }

        },

        getLandingMetrics: function (useCache) {
          this.getCounts(useCache);
          var charts = ['calls', 'conversations', 'contentShared'];
          this.getTimeCharts(useCache, charts);

        },

        getAllMetrics: function (useCache) {
          this.getCounts(useCache);

          var charts = ['calls', 'conversations', 'contentShareSizes', 'contentShared',
            'activeUsers', 'entitlements', 'avgCallsPerUser', 'avgConversations', 'convOneOnOne', 'convGroup',
            'calls', 'callsAvgDuration'
          ];

          this.getTimeCharts(useCache, charts);
          this.getFunnel(useCache);

        },

        getLogInfo: function (locusId, startTime, callback) {
          var logInfoUrl = apiUrl + logInfoBaseUrl + locusId + '?locusCallStartTime=' + startTime;

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
            });
        },

        getCallSummary: function (locusId, startTime, callback) {
          var callSummaryUrl = apiUrl + logInfoBaseUrl + locusId + '/callSummaryEvents' + '?locusCallStartTime=' + startTime;

          $http.get(callSummaryUrl)
            .success(function (data, status) {
              data.success = true;
              Log.debug('Retrieved call summary for : ' + locusId + ' startTime : ' + startTime);
              callback(data, status);
            })
            .error(function (data, status) {
              data.success = false;
              data.status = status;
              callback(data, status);
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
