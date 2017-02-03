(function () {
  'use strict';

  angular.module('Squared')
    .service('ReportsService', ReportsService);

  /* @ngInject */
  function ReportsService($http, $rootScope, Log, Authinfo, UrlConfig) {
    var apiUrl = UrlConfig.getAdminServiceUrl() + 'organization/' + Authinfo.getOrgId() + '/';

    var callMetricsUrl = 'reports/stats/callUsage';
    var activeUsersUrl = 'reports/counts/activeUsers';
    var callsUrl = 'reports/counts/calls';
    var conversationsUrl = 'reports/counts/conversations';

    var timeChartUrl;

    var healthUrl = UrlConfig.getHealthCheckServiceUrl();
    var averageCallCount = 'reports/counts/avgCallsPerUser';
    var entitlementCount = 'reports/counts/entitlements';
    var contentSharedCount = 'reports/counts/contentShared';

    var urls = {
      'callUsage': callMetricsUrl,
      'activeUserCount': activeUsersUrl,
      'averageCallCount': averageCallCount,
      'entitlementCount': entitlementCount,
      'contentSharedCount': contentSharedCount,
      'callsCount': callsUrl,
      'conversationsCount': conversationsUrl
    };

    return {
      apiUrl: apiUrl,
      callMetricsUrl: callMetricsUrl,
      activeUsersUrl: activeUsersUrl,
      callsUrl: callsUrl,
      conversationsUrl: conversationsUrl,
      timeChartUrl: timeChartUrl,
      healthUrl: healthUrl,
      averageCallCount: averageCallCount,
      contentSharedCount: contentSharedCount,
      urls: urls,
      buildUrl: buildUrl,
      sendChartResponse: sendChartResponse,
      getPartnerMetrics: getPartnerMetrics,
      healthMonitor: healthMonitor,
      getHealthStatus: getHealthStatus,
      getOverviewMetrics: getOverviewMetrics
    };

    ///////////////////////

    function buildUrl(metricType, params) {
      var metricUrl = timeChartUrl;

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
    }

    function sendChartResponse(data, status, metricType) {
      var response = {
        'data': data,
        'status': status
      };
      $rootScope.$broadcast(metricType + 'Loaded', response);
    }

    function getTimeCharts(useCache, customerCharts, paramOverrides) {
      var params = _.assign({
        'intervalCount': 1,
        'intervalType': 'month',
        'spanCount': 1,
        'spanType': 'week',
        'cache': useCache,
        'isCustomerView': true
      }, paramOverrides);

      _.forEach(customerCharts, function (customerChart) {
        getUsageMetrics(customerChart, params);
      });
    }

    function getUsageMetrics(metricType, params, orgId) {
      if (Authinfo.isPartner()) { // partner reports
        if (urls[metricType]) { // count metric type
          if (!orgId) { // count for all managed customers
            timeChartUrl = apiUrl + urls[metricType];
          } else { // count for specific managed customer
            timeChartUrl = UrlConfig.getAdminServiceUrl() + 'organization/' + orgId + '/' + urls[metricType];
          }
        } else { // timechart metric type
          if (!orgId) { // timechart for all managed customers
            timeChartUrl = apiUrl + 'reports/timeCharts/managedOrgs/' + metricType;
          } else { // timechart for specific managed customer
            timeChartUrl = UrlConfig.getAdminServiceUrl() + 'organization/' + orgId + '/' + 'reports/timeCharts/' + metricType;
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
          data = _.isObject(data) ? data : {};
          data.success = true;
          Log.debug('Callback for ' + metricType + ' for org=' + Authinfo.getOrgId());
          sendChartResponse(data, status, metricType);
        })
        .error(function (data, status) {
          data = _.isObject(data) ? data : {};
          data.success = false;
          data.status = status;
          data.errorMsg = data;
          sendChartResponse(data, status, metricType);
        });
    }

    function getPartnerMetrics(useCache, orgId, partnerCharts) {
      var params = {
        'intervalCount': 1,
        'intervalType': 'month',
        'spanCount': 1,
        'spanType': 'week',
        'cache': useCache,
        'isCustomerView': false
      };

      _.forEach(partnerCharts, function (partnerChart) {
        getUsageMetrics(partnerChart, params, orgId);
      });
    }

    function getOverviewMetrics(useCache) {
      var charts = ['conversations', 'activeRooms'];
      getTimeCharts(useCache, charts, {
        intervalType: 'week',
        intervalCount: 2,
        spanType: 'week'
      });

      var callCharts = ['oneOnOneCalls', 'groupCalls'];
      getTimeCharts(useCache, callCharts, {
        intervalType: 'month',
        intervalCount: 2,
        spanType: 'month'
      });
    }

    function healthMonitor(callback) {
      $http.get(healthUrl,
        {
          // statuspage.io doesn't play nice w/ our oauth header, so we unset it specifically here
          headers: { Authorization: undefined }
        })
        .success(function (data, status) {
          data = _.isObject(data) ? data : {};
          data.success = true;
          callback(data, status);
        })
        .error(function (data, status) {
          data = _.isObject(data) ? data : {};
          data.success = false;
          callback(data, status);
        });
    }

    function getHealthStatus() {
      var totalSuccess = 0,
        totalWarning = 0,
        totalDanger = 0;

      return $http.get(healthUrl,
        {
          // statuspage.io doesn't play nice w/ our oauth header, so we unset it specifically here
          headers: { Authorization: undefined }
        })
        .then(function (response) {
          var length = response.data.components.length;
          var healthStatus;

          for (var i = 0; i < length; i++) {
            var health = response.data.components[i].status;
            if (health === 'operational') {
              totalSuccess += 1;
            } else if (health === 'degraded_performance' || health === 'partial_outage') {
              totalWarning += 1;
            } else if (health === 'major_outage') {
              totalDanger += 1;
            }
          }

          if (totalSuccess === length) {
            healthStatus = 'success';
          } else if (totalDanger !== 0) {
            healthStatus = 'danger';
          } else if (totalWarning > 0) {
            healthStatus = 'warning';
          }

          return healthStatus;
        }, function (error) {
          return error;
        });
    }
  }
})();
