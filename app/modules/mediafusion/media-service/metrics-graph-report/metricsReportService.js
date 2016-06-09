(function () {
  'use strict';
  angular.module('Mediafusion').service('MetricsReportService', MetricsReportService);
  /* @ngInject */
  function MetricsReportService($http, $translate, $q, Config, Authinfo, Notification, $log, Log, chartColors, UrlConfig) {
    //var urlBase = UrlConfig.getAdminServiceUrl() + 'organization/' + Authinfo.getOrgId() + '/reports/';
    var urlBase = UrlConfig.getAthenaServiceUrl() + '/organizations/' + Authinfo.getOrgId();
    var detailed = 'detailed';
    var topn = 'topn';
    var timechart = 'timeCharts';
    var callVolumeUrl = '/call_volume';
    var clusterAvailability = '/clusters_availability';

    var dateFormat = "MMM DD, YYYY";
    var dayFormat = "MMM DD";
    var monthFormat = "MMMM";
    var timezone = "Etc/GMT";
    var cacheValue = (parseInt(moment.utc().format('H')) >= 8);
    var timeFilter = null;
    // Promise Tracking
    var ABORT = 'ABORT';
    var TIMEOUT = 'TIMEOUT';
    var activePromse = null;
    var activePromseForAvailability = null;
    var mostActivePromise = null;
    var groupCancelPromise = null;
    var oneToOneCancelPromise = null;
    var avgCancelPromise = null;
    var contentSharedCancelPromise = null;
    var contentShareSizesCancelPromise = null;
    var metricsCancelPromise = null;
    var mediaCancelPromise = null;
    var deviceCancelPromise = null;
    return {
      getCallVolumeData: getCallVolumeData,
      getAvailabilityData: getAvailabilityData
    };

    function getCallVolumeData(time, cluster) {
      // cancel any currently running jobs
      if (activePromse !== null && angular.isDefined(activePromse)) {
        activePromse.resolve(ABORT);
      }
      activePromse = $q.defer();
      var returnData = {
        graphData: []
      };
      return getService(urlBase + callVolumeUrl + getQuery(cluster, time), activePromse).then(function (response) {
        if (angular.isDefined(response) && angular.isDefined(response.data) && angular.isDefined(response.data[0].values) && angular.isArray(response.data[0].values) && angular.isDefined(response.data[0])) {
          returnData.graphData.push(response.data[0].values);
          return adjustCallVolumeData(response.data[0].values, returnData);
        } else {
          return returnData;
        }
      }, function (response) {
        return returnErrorCheck(response, 'Active user data not returned for customer.', $translate.instant('activeUsers.overallActiveUserGraphError'), returnData);
      });
    }

    function getAvailabilityData(time, cluster) {
      // cancel any currently running jobs
      if (activePromseForAvailability !== null && angular.isDefined(activePromseForAvailability)) {
        activePromseForAvailability.resolve(ABORT);
      }
      activePromseForAvailability = $q.defer();
      var returnData = [];
      return getService(urlBase + clusterAvailability + getQuery(cluster, time), activePromseForAvailability).then(function (response) {
        if (angular.isDefined(response) && angular.isDefined(response.data) && angular.isDefined(response.data[0]) && angular.isDefined(response.data[0].clusterCategories) && angular.isArray(response.data[0].clusterCategories)) {
          return response;
        } else {
          return returnData;
        }
      }, function (response) {
        return returnErrorCheck(response, 'Active user data not returned for customer.', $translate.instant('activeUsers.overallActiveUserGraphError'), returnData);
      });
    }

    function adjustCallVolumeData(activeData, returnData) {
      var emptyGraph = true;
      var returnDataArray = [];
      var graphItem = {
        colorOne: chartColors.brandRoyalBlue,
        colorTwo: chartColors.brandSkyBlue,
        balloon: true,
        call_reject: 0,
        active_calls: 0,
        timestamp: null
      };
      for (var i = 0; i < activeData.length; i++) {
        var tmpItem = angular.copy(graphItem);
        tmpItem.call_reject = activeData[i].call_reject;
        tmpItem.active_calls = activeData[i].active_calls;
        tmpItem.timestamp = activeData[i].timestamp;
        returnDataArray.push(tmpItem);
      }
      returnData.graphData = returnDataArray;
      return returnData;
    }

    function getReturnGraph(graphItem) {
      var returnGraph = [];
      var item = angular.copy(graphItem);
      returnGraph.push(item);
      return returnGraph;
    }
    /*function getQuery(filter, cacheOption) {
      if (angular.isUndefined(cacheOption) || cacheOption === null) {
        cacheOption = cacheValue;
      }
      if (filter.value === 0) {
        return '?&intervalCount=7&intervalType=day&spanCount=1&spanType=day&cache=' + cacheOption;
      } else if (filter.value === 1) {
        return '?&intervalCount=31&intervalType=day&spanCount=7&spanType=day&cache=' + cacheOption;
      } else {
        return '?&intervalCount=3&intervalType=month&spanCount=1&spanType=month&cache=' + cacheOption;
      }
    }*/
    function getQuery(cluster, time, cacheOption) {
      if (angular.isUndefined(cacheOption) || cacheOption === null) {
        cacheOption = cacheValue;
      }
      if (cluster == "All") {
        //$log.log('the vlaue of cluster is ' + cluster + time);
        return formRelativeTime(time);
      } else {
        //$log.log('the vlaue of cluster is ' + cluster);
        return '/cluster/' + cluster + formRelativeTime(time);
      }
    }

    function formRelativeTime(time) {
      if (time.value === 0) {
        return '/?relativeTime=1d';
      } else if (time.value === 1) {
        return '/?relativeTime=7d';
      } else if (time.value === 2) {
        return '/?relativeTime=30d';
      } else {
        return '/?relativeTime=90d';
      }
    }

    function getService(url, canceler) {
      if (canceler === null || angular.isUndefined(canceler)) {
        return $http.get(url);
      } else {
        return $http.get(url, {
          timeout: canceler.promise
        });
      }
    }

    function returnErrorCheck(error, debugMessage, message, returnItem) {
      if (error.status === 401 || error.status === 403) {
        Log.debug('User not authorized to access reports.  Status: ' + error.status);
        Notification.notify([$translate.instant('reportsPage.unauthorizedError')], 'error');
        return returnItem;
      } else if ((error.status !== 0) || (error.config.timeout.$$state.status === 0)) {
        if (error.status !== 0) {
          Log.debug(debugMessage + '  Status: ' + error.status + ' Response: ' + error.message);
        } else {
          Log.debug(debugMessage + '  Status: ' + error.status);
        }
        if (angular.isDefined(error.data) && angular.isDefined(error.data.trackingId) && (error.data.trackingId !== null)) {
          Notification.notify([message + '<br>' + $translate.instant('reportsPage.trackingId') + error.data.trackingId], 'error');
        } else {
          Notification.notify([message], 'error');
        }
        return returnItem;
      } else {
        return ABORT;
      }
    }
  }
})();
