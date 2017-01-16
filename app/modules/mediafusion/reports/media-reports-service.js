(function () {
  'use strict';

  angular
    .module('Mediafusion')
    .service('MediaReportsService', MediaReportsService);

  function MediaReportsService($http, $translate, Authinfo, Notification, Log, MediaConfigServiceV2, chartColors) {
    var vm = this;

    vm.urlBase = MediaConfigServiceV2.getAthenaUrl() + '/organizations/' + Authinfo.getOrgId();
    vm.allClusters = $translate.instant('mediaFusion.metrics.allclusters');

    function adjustUtilizationData(activeData, returnData, startTime, endTime, graphs) {
      var returnDataArray = [];
      var startDate = {
        time: startTime
      };
      activeData.unshift(startDate);
      for (var i = 0; i < activeData.length; i++) {
        var tmpItem = {};
        tmpItem = activeData[i];
        returnDataArray.push(tmpItem);
      }
      var endDate = {
        time: endTime
      };
      returnDataArray.push(endDate);
      returnData.graphData = returnDataArray;
      returnData.graphs = graphs;
      return returnData;
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

    function getQuerys(link, cluster, time) {
      if (cluster == vm.allClusters) {
        return link + formTimeURL(time);
      } else {
        return '/cluster/' + cluster + link + formTimeURL(time);
      }
    }

    function formTimeURL(time) {
      if (!_.isUndefined(time.startTime) && !_.isUndefined(time.endTime)) {
        return '/?startTime=' + time.startTime + '&endTime=' + time.endTime;
      } else if (time.value === 0) {
        return '/?relativeTime=4h';
      } else if (time.value === 1) {
        return '/?relativeTime=1d';
      } else if (time.value === 2) {
        return '/?relativeTime=7d';
      } else if (time.value === 3) {
        return '/?relativeTime=30d';
      } else {
        return '/?relativeTime=90d';
      }
    }

    function getClusterAvailabilityTooltip(time) {
      var url = vm.urlBase + '/avg_clusters_availability' + formTimeURL(time);
      return $http.get(url);
    }

    function getHostedOnPremisesTooltip(time) {
      var url = vm.urlBase + '/clusters_calls_on_premise' + formTimeURL(time);
      return $http.get(url);
    }

    function getUtilizationData(time, cluster) {
      vm.utilizationUrl = '/utilization';

      var returnData = {
        graphData: [],
        graphs: []
      };
      return $http.get(vm.urlBase + getQuerys(vm.utilizationUrl, cluster, time)).then(function (response) {
        if (!_.isUndefined(response) && !_.isUndefined(response.data) && !_.isUndefined(response.data.chartData) && _.isArray(response.data.chartData) && !_.isUndefined(response.data)) {
          returnData.graphData.push(response.data.chartData);
          return adjustUtilizationData(response.data.chartData, returnData, response.data.startTime, response.data.endTime, response.data.graphs);
        } else {
          return returnData;
        }
      }, function (error) {
        return returnErrorCheck(error, 'Utilization data not returned for customer.', $translate.instant('mediaFusion.metrics.overallUtilizationGraphError'), returnData);
      });
    }

    function getCallVolumeData(time, cluster) {
      vm.callVolumeUrl = '/call_volume';

      var returnData = {
        graphData: []
      };
      return $http.get(vm.urlBase + getQuerys(vm.callVolumeUrl, cluster, time)).then(function (response) {
        if (!_.isUndefined(response) && !_.isUndefined(response.data[0]) && !_.isUndefined(response.data[0].values) && _.isArray(response.data[0].values) && !_.isUndefined(response.data[0])) {
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
      vm.clusterAvailabilityUrl = '/clusters_availability';

      var returnData = [];
      return $http.get(vm.urlBase + getQuerys(vm.clusterAvailabilityUrl, cluster, time)).then(function (response) {
        if (!_.isUndefined(response) && !_.isUndefined(response.data) && !_.isUndefined(response.data[0]) && !_.isUndefined(response.data[0].clusterCategories) && _.isArray(response.data[0].clusterCategories)) {
          return response;
        } else {
          return returnData;
        }
      }, function (response) {
        return returnErrorCheck(response, 'Availability data not returned for customer.', $translate.instant('mediaFusion.metrics.overallAvailabilityGraphError'), returnData);
      });
    }

    function getClusterAvailabilityData(time, cluster) {
      vm.agg_availability = '/agg_availability';

      var returnData = [];
      return $http.get(vm.urlBase + getQuerys(vm.agg_availability, cluster, time)).then(function (response) {
        if (!_.isUndefined(response) && !_.isUndefined(response.data)) {
          return response;
        } else {
          return returnData;
        }
      }, function (error) {
        return returnErrorCheck(error, 'Aggeregated Cluster Availability data not returned for customer.', $translate.instant('mediaFusion.metrics.overallClusterAvailabilityGraphError'), returnData);
      });
    }

    function getTotalCallsData(time, cluster) {
      vm.total_calls = '/total_calls';
      if (cluster !== vm.allClusters) {
        cluster = _.replace(cluster, /\W/g, '');
        cluster = cluster.toLowerCase();
      }

      var returnData = [];
      return $http.get(vm.urlBase + getQuerys(vm.total_calls, cluster, time)).then(function (response) {
        if (!_.isUndefined(response) && !_.isUndefined(response.data)) {
          return response;
        } else {
          return returnData;
        }
      }, function (error) {
        return returnErrorCheck(error, 'Total Number of Calls not returned for customer.', $translate.instant('mediaFusion.metrics.overallTotalNumberOfCallsError'), returnData);
      });
    }

<<<<<<< HEAD:app/modules/mediafusion/reports/media-reports-service.js
=======
    function adjustCallVolumeData(activeData, returnData, startTime, endTime) {
      var returnDataArray = [];
      var graphItem = {
        colorOne: chartColors.primaryBase,
        colorTwo: chartColors.attentionBase,
        balloon: true,
        call_reject: 0,
        active_calls: 0,
        timestamp: null
      };
      var startDate = {
        colorOne: chartColors.primaryBase,
        colorTwo: chartColors.attentionBase,
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
        colorOne: chartColors.primaryBase,
        colorTwo: chartColors.attentionBase,
        timestamp: endTime
      };
      returnDataArray.push(endDate);
      returnData.graphData = returnDataArray;
      return returnData;
    }

    function adjustUtilizationData(activeData, returnData, startTime, endTime, graphs) {
      var returnDataArray = [];
      var startDate = {
        time: startTime
      };
      activeData.unshift(startDate);
      for (var i = 0; i < activeData.length; i++) {
        var tmpItem = {};
        tmpItem = activeData[i];
        returnDataArray.push(tmpItem);
      }
      var endDate = {
        time: endTime
      };
      returnDataArray.push(endDate);
      returnData.graphData = returnDataArray;
      returnData.graphs = graphs;
      return returnData;
    }

    function getClusterAvailabilityTooltip(time) {
      var url = urlBase + clusterAvailabilitySneakPeak + formRelativeTime(time);
      return $http.get(url);
    }

    function getHostedOnPremisesTooltip(time) {
      var url = urlBase + hostedonPremisesSneakPeak + formRelativeTime(time);
      return $http.get(url);
    }

    function getOverflowedToCloudTooltip(time) {
      var url = urlBase + overflowedtoCloudSneakPeak + formRelativeTime(time);
      return $http.get(url);
    }

    function getQuerys(link, cluster, time, cacheOption) {
      if (_.isUndefined(cacheOption) || cacheOption === null) {
        cacheOption = cacheValue;
      }
      if (cluster == allClusters) {
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
      } else if (time.value === 3) {
        return '/?relativeTime=90d';
      } else if (time.value === 4) {
        return '/?relativeTime=4h';
      }
    }

    function getService(url, canceler) {
      if (canceler === null || _.isUndefined(canceler)) {
        return $http.get(url);
      } else {
        return $http.get(url, {
          timeout: canceler.promise
        });
      }
    }
>>>>>>> f734b412f6bc6f4312cb02dd0a28b16d13819bb8:app/modules/mediafusion/media-service-report-v2/metrics-report/metricsReportServiceV2.js

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
        if (!_.isUndefined(error.data) && !_.isUndefined(error.data.trackingId) && (error.data.trackingId !== null)) {
          Notification.notify([message + '<br>' + $translate.instant('reportsPage.trackingId') + error.data.trackingId], 'error');
        } else {
          Notification.notify([message], 'error');
        }
        return returnItem;
      }
    }

    return {
      getUtilizationData: getUtilizationData,
      getCallVolumeData: getCallVolumeData,
      getAvailabilityData: getAvailabilityData,
      getClusterAvailabilityData: getClusterAvailabilityData,
      getTotalCallsData: getTotalCallsData,
      getClusterAvailabilityTooltip: getClusterAvailabilityTooltip,
      getHostedOnPremisesTooltip: getHostedOnPremisesTooltip
    };

  }
})();
