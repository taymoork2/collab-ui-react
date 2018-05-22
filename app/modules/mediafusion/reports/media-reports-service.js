(function () {
  'use strict';

  angular
    .module('Mediafusion')
    .service('MediaReportsService', MediaReportsService);

  var ChartColors = require('modules/core/config/chartColors').ChartColors;

  function MediaReportsService($http, $translate, Authinfo, InsightGraphService, Notification, UrlConfig) {
    var vm = this;
    vm.urlBase = UrlConfig.getAthenaServiceUrl() + '/organizations/' + Authinfo.getOrgId();
    vm.allClusters = $translate.instant('mediaFusion.metrics.allclusters');
    vm.onPremisesHeading = $translate.instant('mediaFusion.metrics.onPremisesHeading');
    vm.cloudHeading = $translate.instant('mediaFusion.metrics.cloudHeading');
    vm.hybridHeading = $translate.instant('mediaFusion.metrics.hybridHeading');
    vm.allOn = $translate.instant('mediaFusion.metrics.allOn');
    vm.allOff = $translate.instant('mediaFusion.metrics.allOff');
    vm.clientTypeTranMap = {
      ANDROID: $translate.instant('mediaFusion.metrics.clientType.android'),
      BLACKBERRY: $translate.instant('mediaFusion.metrics.clientType.blackberry'),
      DESKTOP: $translate.instant('mediaFusion.metrics.clientType.desktop'),
      IPAD: $translate.instant('mediaFusion.metrics.clientType.ipad'),
      IPHONE: $translate.instant('mediaFusion.metrics.clientType.iphone'),
      JABBER: $translate.instant('mediaFusion.metrics.clientType.jabber'),
      SIP: $translate.instant('mediaFusion.metrics.clientType.sip'),
      WEBEX_BOARD: $translate.instant('mediaFusion.metrics.clientType.board'),
      WEBEX_VOICE: $translate.instant('mediaFusion.metrics.clientType.webexvoice'),
      WEBEX_SHARE: $translate.instant('mediaFusion.metrics.clientType.webexshare'),
      TEST: $translate.instant('mediaFusion.metrics.clientType.test'),
      TP_ENDPOINT: $translate.instant('mediaFusion.metrics.clientType.tp'),
      UC: $translate.instant('mediaFusion.metrics.clientType.uc'),
      UNKNOWN: $translate.instant('mediaFusion.metrics.clientType.unknown'),
      WINDOWS_MOBILE: $translate.instant('mediaFusion.metrics.clientType.windows'),
      Total: $translate.instant('mediaFusion.metrics.clientType.total'),
      MAC: $translate.instant('mediaFusion.metrics.clientType.mac'),
      WINDOWS: $translate.instant('mediaFusion.metrics.clientType.windowsDesk'),
    };

    function adjustLineGraphData(activeData, returnData, startTime, endTime, graphs) {
      var returnDataArray = [];
      var startDate = {
        time: startTime,
      };
      activeData.unshift(startDate);
      for (var i = 0; i < activeData.length; i++) {
        var tmpItem = {};
        tmpItem = activeData[i];
        returnDataArray.push(tmpItem);
      }
      var endDate = {
        time: endTime,
      };
      returnDataArray.push(endDate);
      returnData.graphData = returnDataArray;
      returnData.graphs = graphs;
      return returnData;
    }

    function adjustCallVolumeData(activeData, returnData, startTime, endTime) {
      var returnDataArray = [];
      var graphItem = {
        colorOne: ChartColors.primaryBase,
        colorTwo: ChartColors.attentionBase,
        balloon: true,
        call_reject: 0,
        active_calls: 0,
        timestamp: null,
      };
      var startDate = {
        colorOne: ChartColors.primaryBase,
        colorTwo: ChartColors.attentionBase,
        call_reject: 0,
        active_calls: 0,
        timestamp: startTime,
      };
      activeData.unshift(startDate);
      for (var i = 0; i < activeData.length; i++) {
        var tmpItem = _.cloneDeep(graphItem);
        tmpItem.call_reject = activeData[i].call_reject;
        tmpItem.active_calls = activeData[i].active_calls;
        tmpItem.timestamp = activeData[i].timestamp;
        returnDataArray.push(tmpItem);
      }
      var endDate = {
        colorOne: ChartColors.primaryBase,
        colorTwo: ChartColors.attentionBase,
        timestamp: endTime,
      };
      returnDataArray.push(endDate);
      returnData.graphData = returnDataArray;
      return returnData;
    }

    function addColorForMeetingsCard(response) {
      _.each(response.data.dataProvider, function (val) {
        if (val.name === 'ON_PREM') {
          val.color = '#22D5A3';
          val.name = vm.onPremisesHeading;
        } else if (val.name === 'CLOUD') {
          val.color = '#1FBBCA';
          val.name = vm.cloudHeading;
        } else if (val.name === 'HYBRID') {
          val.color = '#FD713E';
          val.name = vm.hybridHeading;
        }
      });
      return response;
    }

    function translateClientTypeData(response) {
      _.each(response.data.dataProvider, function (val) {
        if (!_.isUndefined(vm.clientTypeTranMap[val.name])) {
          val.name = vm.clientTypeTranMap[val.name];
        }
      });
      return response;
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
        graphs: [],
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
        graphData: [],
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

    function getParticipantDistributionData(time, cluster, multipleinsight) {
      if (multipleinsight) {
        vm.callDistributionUrl = '/clusters_call_volume_with_multiple_insights';
      } else {
        vm.callDistributionUrl = '/clusters_call_volume_with_insights';
      }
      var returnData = {
        graphData: [],
        graphs: [],
      };
      return $http.get(vm.urlBase + getQuerys(vm.callDistributionUrl, cluster, time)).then(function (response) {
        if (!_.isUndefined(response) && !_.isUndefined(response.data) && !_.isUndefined(response.data.chartData) && _.isArray(response.data.chartData) && !_.isUndefined(response.data)) {
          returnData.graphData.push(response.data.chartData);
          var adjustedData = adjustLineGraphData(response.data.chartData, returnData, response.data.startTime, response.data.endTime, response.data.graphs);
          return InsightGraphService.getAdjustedInsightData(adjustedData);
        } else {
          return returnData;
        }
      }, function (error) {
        return returnErrorCheck(error, $translate.instant('mediaFusion.metrics.overallParticipantDistributionGraphError'), returnData);
      });
    }

    function getCascadeBandwidthData(time, cluster, cascadeBandwidthSelected) {
      if (cluster === vm.allClusters) {
        vm.cascadeBandwidthUrl = '/cascade_bandwidth_usage_for_cluster/media/' + cascadeBandwidthSelected;
      } else {
        vm.cascadeBandwidthUrl = '/cascade_bandwidth_usage_for_cluster/';
      }
      var returnData = {
        graphData: [],
        graphs: [],
      };
      var clusterName = cluster === vm.allClusters ? cluster : cluster.replace(/\W/g, '').toLowerCase();
      return $http.get(vm.urlBase + getQuerys(vm.cascadeBandwidthUrl, clusterName, time)).then(function (response) {
        if (!_.isUndefined(response) && !_.isUndefined(response.data) && !_.isUndefined(response.data.chartData) && _.isArray(response.data.chartData) && !_.isUndefined(response.data)) {
          returnData.graphData.push(response.data.chartData);
          var adjustedData = adjustLineGraphData(response.data.chartData, returnData, response.data.startTime, response.data.endTime, response.data.graphs);
          return InsightGraphService.getAdjustedInsightData(adjustedData);
        } else {
          return returnData;
        }
      }, function (error) {
        return returnErrorCheck(error, $translate.instant('mediaFusion.metrics.overallUtilizationGraphError'), returnData);
      });
    }

    function getStreamsBandwidthData(time, cluster, streamsBandwidthSelected) {
      vm.streamsBandwidthUrl = '/cascade_bandwidth_usage_for_cluster/media/' + streamsBandwidthSelected;
      var returnData = {
        graphData: [],
        graphs: [],
      };
      var clusterName = cluster.replace(/\W/g, '').toLowerCase();
      return $http.get(vm.urlBase + getQuerys(vm.streamsBandwidthUrl, clusterName, time)).then(function (response) {
        if (!_.isUndefined(response) && !_.isUndefined(response.data) && !_.isUndefined(response.data.chartData) && _.isArray(response.data.chartData) && !_.isUndefined(response.data)) {
          returnData.graphData.push(response.data.chartData);
          var adjustedData = adjustLineGraphData(response.data.chartData, returnData, response.data.startTime, response.data.endTime, response.data.graphs);
          return InsightGraphService.getAdjustedInsightData(adjustedData);
        } else {
          return returnData;
        }
      }, function (error) {
        return returnErrorCheck(error, $translate.instant('mediaFusion.metrics.overallUtilizationGraphError'), returnData);
      });
    }

    function getClientTypeData(time, clientType) {
      vm.clientTypeUrl = '/client_type_trend';
      clientType = formatClientType(clientType);

      var returnData = {
        graphData: [],
        graphs: [],
      };
      return $http.get(vm.urlBase + getQuerys(vm.clientTypeUrl, vm.allClusters, time) + '&hostedAt=' + clientType).then(function (response) {
        if (!_.isUndefined(response) && !_.isUndefined(response.data) && !_.isUndefined(response.data.chartData) && _.isArray(response.data.chartData) && !_.isUndefined(response.data)) {
          returnData.graphData.push(response.data.chartData);
          return adjustLineGraphData(response.data.chartData, returnData, response.data.startTime, response.data.endTime, response.data.graphs);
        } else {
          return returnData;
        }
      }, function (error) {
        return returnErrorCheck(error, $translate.instant('mediaFusion.metrics.overallClientTypeGraphError'), returnData);
      });
    }

    function getNumberOfParticipantData(time, multipleinsight) {
      if (multipleinsight) {
        vm.numberOfParticipantUrl = '/participants_activity_with_multiple_insights';//url for multiple insight
      } else {
        vm.numberOfParticipantUrl = '/participants_activity_with_insights';
      }
      var returnData = {
        graphData: [],
        graphs: [],
      };
      return $http.get(vm.urlBase + getQuerys(vm.numberOfParticipantUrl, vm.allClusters, time)).then(function (response) {
        if (!_.isUndefined(response) && !_.isUndefined(response.data) && !_.isUndefined(response.data.chartData) && _.isArray(response.data.chartData) && !_.isUndefined(response.data)) {
          returnData.graphData.push(response.data.chartData);
          var adjustedData = adjustLineGraphData(response.data.chartData, returnData, response.data.startTime, response.data.endTime, response.data.graphs);
          return InsightGraphService.getAdjustedInsightData(adjustedData);
        } else {
          return returnData;
        }
      }, function (error) {
        return returnErrorCheck(error, $translate.instant('mediaFusion.metrics.overallClientTypeGraphError'), returnData);
      });
    }

    function getMeetingLocationData(time) {
      vm.meetingLcationUrl = '/meeting_location_trend';

      var returnData = {
        graphData: [],
        graphs: [],
      };
      return $http.get(vm.urlBase + getQuerys(vm.meetingLcationUrl, vm.allClusters, time)).then(function (response) {
        if (!_.isUndefined(response) && !_.isUndefined(response.data) && !_.isUndefined(response.data.chartData) && _.isArray(response.data.chartData) && !_.isUndefined(response.data)) {
          returnData.graphData.push(response.data.chartData);
          return adjustLineGraphData(response.data.chartData, returnData, response.data.startTime, response.data.endTime, response.data.graphs);
        } else {
          return returnData;
        }
      }, function (error) {
        return returnErrorCheck(error, $translate.instant('mediaFusion.metrics.overallMeetingLocationGraphError'), returnData);
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

    function getClientTypeCardData(time, clientType) {
      vm.total_calls = '/client_type_count';
      clientType = formatClientType(clientType);
      var returnData = [];
      return $http.get(vm.urlBase + getQuerys(vm.total_calls, vm.allClusters, time) + '&hostedAt=' + clientType).then(function (response) {
        if (!_.isUndefined(response) && !_.isUndefined(response.data)) {
          return translateClientTypeData(response);
        } else {
          return returnData;
        }
      }, function (error) {
        return returnErrorCheck(error, $translate.instant('mediaFusion.metrics.overallTotalNumberOfCallsError'), returnData);
      });
    }

    function getMeetingLocationCardData(time) {
      vm.meetingLocationCardUrl = '/meeting_location_count';
      var returnData = [];
      return $http.get(vm.urlBase + getQuerys(vm.meetingLocationCardUrl, vm.allClusters, time)).then(function (response) {
        if (!_.isUndefined(response) && !_.isUndefined(response.data)) {
          return addColorForMeetingsCard(response);
        } else {
          return returnData;
        }
      }, function (error) {
        return returnErrorCheck(error, $translate.instant('mediaFusion.metrics.overallTotalNumberOfCallsError'), returnData);
      });
    }

    function getOverflowIndicator(time, cluster) {
      if (cluster === vm.allClusters) {
        vm.participant_change = '/overflow_participant_change';
      } else {
        vm.participant_change = '/redirect_participant_change';
      }
      var returnData = [];
      return $http.get(vm.urlBase + getQuerys(vm.participant_change, cluster, time)).then(function (response) {
        if (!_.isUndefined(response) && !_.isUndefined(response.data)) {
          return response;
        } else {
          return returnData;
        }
      }, function (error) {
        return returnErrorCheck(error, $translate.instant('mediaFusion.metrics.overallCallVolumeGraphError'), returnData);
      });
    }

    function returnErrorCheck(error, message, returnItem) {
      if (error.status === 401 || error.status === 403) {
        Notification.errorWithTrackingId(error, 'reportsPage.unauthorizedError');
        return returnItem;
      } else if ((error.status !== 0) || (error.config.timeout.$$state.status === 0)) {
        Notification.errorWithTrackingId(error, message);
        return returnItem;
      }
    }

    function formatClientType(clientType) {
      if (clientType === 1) {
        return 'onPrem';
      } else if (clientType === 2) {
        return 'cloud';
      } else {
        return 'all';
      }
    }

    function legendHandlerForGraphs(graphs, event) {
      vm.legendGraphs = graphs;
      var evt = event;
      var cluster = false;
      _.forEach(vm.legendGraphs, function (graph) {
        if (graph.title === evt.dataItem.title && evt.type === 'hideItem') {
          graph.legendtracker = false;
        } else if (graph.title === evt.dataItem.title && evt.type === 'showItem') {
          graph.legendtracker = true;
        }
      });
      _.forEach(vm.legendGraphs, function (graph) {
        if (!graph.legendtracker && !_.isUndefined(graph.legendtracker)) {
          cluster = true;
        } else if (graph.title !== vm.allOff) {
          cluster = false;
          return cluster;
        }
      });
      _.forEach(evt.chart.graphs, function (graph) {
        if (cluster && graph.title === vm.allOff) {
          graph.title = vm.allOn;
          evt.chart.showGraph(graph);
        } else if (!cluster && graph.title === vm.allOn) {
          graph.title = vm.allOff;
          evt.chart.showGraph(graph);
        }
      });
    }

    return {
      getUtilizationData: getUtilizationData,
      getCallVolumeData: getCallVolumeData,
      getParticipantDistributionData: getParticipantDistributionData,
      getAvailabilityData: getAvailabilityData,
      getClusterAvailabilityData: getClusterAvailabilityData,
      getCascadeBandwidthData: getCascadeBandwidthData,
      getStreamsBandwidthData: getStreamsBandwidthData,
      getTotalCallsData: getTotalCallsData,
      getClusterAvailabilityTooltip: getClusterAvailabilityTooltip,
      getHostedOnPremisesTooltip: getHostedOnPremisesTooltip,
      getClientTypeData: getClientTypeData,
      getClientTypeCardData: getClientTypeCardData,
      getMeetingLocationData: getMeetingLocationData,
      getNumberOfParticipantData: getNumberOfParticipantData,
      getMeetingLocationCardData: getMeetingLocationCardData,
      getOverflowIndicator: getOverflowIndicator,
      legendHandlerForGraphs: legendHandlerForGraphs,
    };
  }
})();
