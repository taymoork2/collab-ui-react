(function () {
  'use strict';

  angular
    .module('Mediafusion')
    .service('MediaReportsService', MediaReportsService);

  function MediaReportsService($http, $translate, Authinfo, Notification, MediaConfigServiceV2, chartColors) {
    var vm = this;

    vm.urlBase = MediaConfigServiceV2.getAthenaUrl() + '/organizations/' + Authinfo.getOrgId();
    vm.allClusters = $translate.instant('mediaFusion.metrics.allclusters');

    function adjustLineGraphData(activeData, returnData, startTime, endTime, graphs) {
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

    function getQuerys(link, cluster, time) {
      if (cluster == vm.allClusters) {
        return link + formTimeURL(time);
      } else {
        return '/cluster/' + cluster + link + formTimeURL(time);
      }
    }

    function formTimeURL(time) {
      if (!_.isUndefined(time.startTime) && !_.isUndefined(time.endTime)) {
        return '/?startTime=' + moment.utc(time.startTime, 'YYYY-MM-DDTHH:mm:ssZ').toJSON() + '&endTime=' + moment.utc(time.endTime, 'YYYY-MM-DDTHH:mm:ssZ').toJSON();
      } else if (time.value === 0) {
        return '/?relativeTime=4h';
      } else if (time.value === 1) {
        return '/?relativeTime=1d';
      } else if (time.value === 2) {
        return '/?relativeTime=7d';
      } else if (time.value === 3) {
        return '/?relativeTime=30d';
      } else if (time.value === 4) {
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
          return adjustLineGraphData(response.data.chartData, returnData, response.data.startTime, response.data.endTime, response.data.graphs);
        } else {
          return returnData;
        }
      }, function (error) {
        return returnErrorCheck(error, $translate.instant('mediaFusion.metrics.overallUtilizationGraphError'), returnData);
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
      }, function (error) {
        return returnErrorCheck(error, $translate.instant('mediaFusion.metrics.overallCallVolumeGraphError'), returnData);
      });
    }

    function getParticipantDistributionData(time, cluster) {
      vm.callDistributionUrl = '/clusters_call_volume';

      var returnData = {
        graphData: [],
        graphs: []
      };
      return $http.get(vm.urlBase + getQuerys(vm.callDistributionUrl, cluster, time)).then(function (response) {
        if (!_.isUndefined(response) && !_.isUndefined(response.data) && !_.isUndefined(response.data.chartData) && _.isArray(response.data.chartData) && !_.isUndefined(response.data)) {
          returnData.graphData.push(response.data.chartData);
          return adjustLineGraphData(response.data.chartData, returnData, response.data.startTime, response.data.endTime, response.data.graphs);
        } else {
          return returnData;
        }
      }, function (error) {
        return returnErrorCheck(error, $translate.instant('mediaFusion.metrics.overallParticipantDistributionGraphError'), returnData);
      });
    }

    function getClientTypeData(time) {
      vm.clientTypeUrl = '/client_type_trend';

      var returnData = {
        graphData: [],
        graphs: []
      };
      return $http.get(vm.urlBase + getQuerys(vm.clientTypeUrl, vm.allClusters, time)).then(function (response) {
        if (!_.isUndefined(response) && !_.isUndefined(response.data) && !_.isUndefined(response.data.chartData) && _.isArray(response.data.chartData) && !_.isUndefined(response.data)) {
          returnData.graphData.push(response.data.chartData);
          return adjustLineGraphData(response.data.chartData, returnData, response.data.startTime, response.data.endTime, response.data.graphs);
        } else {
          return returnData;
        }
      }, function (error) {
        return returnErrorCheck(error, $translate.instant('mediaFusion.metrics.overallParticipantDistributionGraphError'), returnData);
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
      }, function (error) {
        return returnErrorCheck(error, $translate.instant('mediaFusion.metrics.overallAvailabilityGraphError'), returnData);
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
        return returnErrorCheck(error, $translate.instant('mediaFusion.metrics.overallClusterAvailabilityGraphError'), returnData);
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
        return returnErrorCheck(error, $translate.instant('mediaFusion.metrics.overallTotalNumberOfCallsError'), returnData);
      });
    }

    function returnErrorCheck(error, message, returnItem) {
      if (error.status === 401 || error.status === 403) {
        Notification.error('reportsPage.unauthorizedError');
        return returnItem;
      } else if ((error.status !== 0) || (error.config.timeout.$$state.status === 0)) {
        Notification.errorWithTrackingId(error, message);
        return returnItem;
      }
    }

    return {
      getUtilizationData: getUtilizationData,
      getCallVolumeData: getCallVolumeData,
      getParticipantDistributionData: getParticipantDistributionData,
      getAvailabilityData: getAvailabilityData,
      getClusterAvailabilityData: getClusterAvailabilityData,
      getTotalCallsData: getTotalCallsData,
      getClusterAvailabilityTooltip: getClusterAvailabilityTooltip,
      getHostedOnPremisesTooltip: getHostedOnPremisesTooltip,
      getClientTypeData: getClientTypeData
    };

  }
})();
