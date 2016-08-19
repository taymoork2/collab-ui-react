(function () {
  'use strict';
  angular.module('Mediafusion').service('MetricsReportService', MetricsReportService);
  /* @ngInject */
  function MetricsReportService($http, $translate, $q, Authinfo, Notification, Log, chartColors, UrlConfig) {
    var urlBase = UrlConfig.getAthenaServiceUrl() + '/organizations/' + Authinfo.getOrgId();
    var utilizationUrl = '/cpu_utilization';
    var callVolumeUrl = '/call_volume';
    var clusterAvailability = '/clusters_availability';
    var agg_availability = '/agg_availability';
    var agg_cpu_utilization = '/agg_cpu_utilization';
    var total_calls = '/total_calls';

    var cacheValue = (parseInt(moment.utc().format('H'), 10) >= 8);
    // Promise Tracking
    var ABORT = 'ABORT';
    var activePromise = null;
    var activePromiseForAvailability = null;
    var activePromiseForUtilization = null;
    var activePromiseForClusterAvailability = null;
    var activePromiseForCPUUtilization = null;
    var activePromiseForTotalCalls = null;

    return {
      getUtilizationData: getUtilizationData,
      getCallVolumeData: getCallVolumeData,
      getAvailabilityData: getAvailabilityData,
      getClusterAvailabilityData: getClusterAvailabilityData,
      getCPUUtilizationData: getCPUUtilizationData,
      getTotalCallsData: getTotalCallsData
    };

    function getUtilizationData(time, cluster) {
      if (activePromise !== null && angular.isDefined(activePromise)) {
        activePromise.resolve(ABORT);
      }
      activePromise = $q.defer();
      var returnData = {
        graphData: []
      };
      return getService(urlBase + getQuerys(utilizationUrl, cluster, time), activePromiseForUtilization).then(function (response) {
        if (angular.isDefined(response) && angular.isDefined(response.data[0]) && angular.isDefined(response.data[0].cpuUtilValues) && angular.isArray(response.data[0].cpuUtilValues) && angular.isDefined(response.data[0])) {
          returnData.graphData.push(response.data[0].cpuUtilValues);
          return adjustUtilizationData(response.data[0].cpuUtilValues, returnData, response.data[0].startTime, response.data[0].endTime);
        } else {
          return returnData;
        }
      }, function (response) {
        return returnErrorCheck(response, 'Utilization data not returned for customer.', $translate.instant('mediaFusion.metrics.overallUtilizationGraphError'), returnData);
      });
    }

    function getCallVolumeData(time, cluster) {
      // cancel any currently running jobs
      if (activePromise !== null && angular.isDefined(activePromise)) {
        activePromise.resolve(ABORT);
      }
      activePromise = $q.defer();
      var returnData = {
        graphData: []
      };
      return getService(urlBase + getQuerys(callVolumeUrl, cluster, time), activePromise).then(function (response) {
        if (angular.isDefined(response) && angular.isDefined(response.data[0]) && angular.isDefined(response.data[0].values) && angular.isArray(response.data[0].values) && angular.isDefined(response.data[0])) {
          returnData.graphData.push(response.data[0].values);
          return adjustCallVolumeData(response.data[0].values, returnData, response.data[0].startTime, response.data[0].endTime);
        } else {
          return returnData;
        }
      }, function (response) {
        return returnErrorCheck(response, 'Total Number of Calls data not returned for customer.', $translate.instant('mediaFusion.metrics.overallCallVolumeGraphError'), returnData);
      });
    }

    function getAvailabilityData(time, cluster) {
      // cancel any currently running jobs
      if (activePromiseForAvailability !== null && angular.isDefined(activePromiseForAvailability)) {
        activePromiseForAvailability.resolve(ABORT);
      }
      activePromiseForAvailability = $q.defer();
      var returnData = [];
      return getService(urlBase + getQuerys(clusterAvailability, cluster, time), activePromiseForAvailability).then(function (response) {
        if (angular.isDefined(response) && angular.isDefined(response.data) && angular.isDefined(response.data[0]) && angular.isDefined(response.data[0].clusterCategories) && angular.isArray(response.data[0].clusterCategories)) {
          return response;
        } else {
          return returnData;
        }
      }, function (response) {
        return returnErrorCheck(response, 'Availability data not returned for customer.', $translate.instant('mediaFusion.metrics.overallAvailabilityGraphError'), returnData);
      });
    }

    function getClusterAvailabilityData(time, cluster) {
      // cancel any currently running jobs
      if (activePromiseForClusterAvailability !== null && angular.isDefined(activePromiseForClusterAvailability)) {
        activePromiseForClusterAvailability.resolve(ABORT);
      }
      activePromiseForClusterAvailability = $q.defer();
      var returnData = [];
      return getService(urlBase + getQuerys(agg_availability, cluster, time), activePromiseForClusterAvailability).then(function (response) {
        if (angular.isDefined(response) && angular.isDefined(response.data)) {
          return response;
        } else {
          return returnData;
        }
      }, function (response) {
        return returnErrorCheck(response, 'Aggeregated Cluster Availability data not returned for customer.', $translate.instant('mediaFusion.metrics.overallClusterAvailabilityGraphError'), returnData);
      });
    }

    function getCPUUtilizationData(time, cluster) {
      // cancel any currently running jobs
      if (activePromiseForCPUUtilization !== null && angular.isDefined(activePromiseForCPUUtilization)) {
        activePromiseForCPUUtilization.resolve(ABORT);
      }
      activePromiseForCPUUtilization = $q.defer();
      var returnData = [];
      return getService(urlBase + getQuerys(agg_cpu_utilization, cluster, time), activePromiseForCPUUtilization).then(function (response) {
        if (angular.isDefined(response) && angular.isDefined(response.data)) {
          return response;
        } else {
          return returnData;
        }
      }, function (response) {
        return returnErrorCheck(response, 'Aggeregated CPU Utilization data not returned for customer.', $translate.instant('mediaFusion.metrics.overallAverageUtilizationGraphError'), returnData);
      });
    }

    function getTotalCallsData(time, cluster) {
      // cancel any currently running jobs
      if (activePromiseForTotalCalls !== null && angular.isDefined(activePromiseForTotalCalls)) {
        activePromiseForTotalCalls.resolve(ABORT);
      }
      activePromiseForTotalCalls = $q.defer();
      var returnData = [];
      return getService(urlBase + getQuerys(total_calls, cluster, time), activePromiseForTotalCalls).then(function (response) {
        if (angular.isDefined(response) && angular.isDefined(response.data)) {
          return response;
        } else {
          return returnData;
        }
      }, function (response) {
        return returnErrorCheck(response, 'Total Number of Calls not returned for customer.', $translate.instant('mediaFusion.metrics.overallTotalNumberOfCallsError'), returnData);
      });
    }

    function adjustCallVolumeData(activeData, returnData, startTime, endTime) {
      var returnDataArray = [];
      var graphItem = {
        colorOne: chartColors.metricBlue,
        colorTwo: chartColors.metricYellow,
        balloon: true,
        call_reject: 0,
        active_calls: 0,
        timestamp: null
      };
      var startDate = {
        colorOne: chartColors.metricBlue,
        colorTwo: chartColors.metricYellow,
        call_reject: 0,
        active_calls: 0,
        timestamp: startTime
      };
      activeData.unshift(startDate);
      for (var i = 0; i < activeData.length; i++) {
        var tmpItem = angular.copy(graphItem);
        tmpItem.call_reject = activeData[i].call_reject;
        tmpItem.active_calls = activeData[i].active_calls;
        tmpItem.timestamp = activeData[i].timestamp;
        returnDataArray.push(tmpItem);
      }
      var endDate = {
        colorOne: chartColors.metricBlue,
        colorTwo: chartColors.metricYellow,
        timestamp: endTime
      };
      returnDataArray.push(endDate);
      returnData.graphData = returnDataArray;
      return returnData;
    }

    function adjustUtilizationData(activeData, returnData, startTime, endTime) {
      var returnDataArray = [];
      var graphItem = {
        colorOne: chartColors.metricDarkGreen,
        colorTwo: chartColors.metricLightGreen,
        balloon: true,
        average_cpu: 0.0,
        peak_cpu: 0.0,
        timestamp: null
      };
      var startDate = {
        colorOne: chartColors.metricDarkGreen,
        colorTwo: chartColors.metricLightGreen,
        average_cpu: 0.0,
        peak_cpu: 0.0,
        timestamp: startTime
      };
      activeData.unshift(startDate);
      for (var i = 0; i < activeData.length; i++) {
        var tmpItem = angular.copy(graphItem);
        tmpItem.average_cpu = activeData[i].average_cpu;
        tmpItem.peak_cpu = activeData[i].peak_cpu;
        tmpItem.timestamp = activeData[i].timestamp;
        returnDataArray.push(tmpItem);
      }
      var endDate = {
        colorOne: chartColors.metricDarkGreen,
        colorTwo: chartColors.metricLightGreen,
        timestamp: endTime
      };
      returnDataArray.push(endDate);
      returnData.graphData = returnDataArray;
      return returnData;
    }

    function getQuerys(link, cluster, time, cacheOption) {
      if (angular.isUndefined(cacheOption) || cacheOption === null) {
        cacheOption = cacheValue;
      }
      if (cluster == "All Clusters") {
        return link + formRelativeTime(time);
      } else {
        return '/cluster/' + cluster + link + formRelativeTime(time);
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
        Notification.error('reportsPage.unauthorizedError');
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
