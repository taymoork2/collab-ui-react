(function () {
  'use strict';

  angular.module('Mediafusion').service('CallVolumeResourceGraphService', CallVolumeResourceGraphService);
  /* @ngInject */
  function CallVolumeResourceGraphService(CommonReportsGraphService, $translate, $rootScope) {

    var vm = this;
    vm.callVolumediv = 'callVolumediv';
    vm.COLUMN = 'column';
    vm.AXIS = 'axis';
    vm.NUMFORMAT = 'numFormat';
    vm.LEGEND = 'legend';
    vm.titles = [];
    vm.baloontitles = [];
    vm.dateSelected = null;
    vm.zoomedEndTime = null;
    vm.zoomedStartTime = null;

    vm.allClusters = $translate.instant('mediaFusion.metrics.allclusters');
    vm.timeStamp = $translate.instant('mediaFusion.metrics.timeStamp');
    // variables for the call volume section
    vm.callLocalTitle = $translate.instant('mediaFusion.metrics.callLocal');
    vm.callRejectTitle = $translate.instant('mediaFusion.metrics.callReject');
    vm.callLocalClusterTitle = $translate.instant('mediaFusion.metrics.callLocalCluster');
    vm.callRedirectedClusterTitle = $translate.instant('mediaFusion.metrics.callRedirectedCluster');
    //legendtexts
    vm.legendcallLocalTitle = $translate.instant('mediaFusion.metrics.legendcallLocal');
    vm.legendcallRejectTitle = $translate.instant('mediaFusion.metrics.legendcallReject');
    vm.legendcallLocalClusterTitle = $translate.instant('mediaFusion.metrics.legendcallLocalCluster');
    vm.legendcallRedirectedClusterTitle = $translate.instant('mediaFusion.metrics.legendcallRedirectedCluster');

    return {
      setCallVolumeGraph: setCallVolumeGraph
    };

    function setCallVolumeGraph(data, callVolumeChart, cluster, daterange) {
      if (data === null || data === 'undefined' || data.length === 0) {
        return undefined;
      } else {
        var startDuration = 1;
        if (!data[0].balloon) {
          startDuration = 0;
        }
        callVolumeChart = createCallVolumeGraph(data, cluster, daterange);
        callVolumeChart.dataProvider = data;
        callVolumeChart.graphs = callVolumeGraphs(data, cluster, daterange);
        callVolumeChart.startDuration = startDuration;
        callVolumeChart.validateData();
        return callVolumeChart;
      }
    }

    function createCallVolumeGraph(data, cluster, daterange) {
      // if there are no active users for this user
      if (data === null || data === 'undefined' || data.length === 0) {
        return;
      }
      vm.dateSelected = daterange;
      var valueAxes = [CommonReportsGraphService.getBaseVariable(vm.AXIS)];
      valueAxes[0].integersOnly = true;
      valueAxes[0].axisAlpha = 0.5;
      valueAxes[0].axisColor = '#1C1C1C';
      valueAxes[0].minimum = 0;
      valueAxes[0].autoGridCount = true;
      valueAxes[0].stackType = 'regular';
      var catAxis = CommonReportsGraphService.getBaseVariable(vm.AXIS);
      catAxis.gridPosition = 'start';
      catAxis.parseDates = true;
      catAxis.startOnAxis = true;
      catAxis.axisAlpha = 0.5;
      catAxis.axisColor = '#1C1C1C';
      catAxis.gridAlpha = 0.1;
      catAxis.minorGridAlpha = 0.1;
      catAxis.minorGridEnabled = false;
      catAxis.minPeriod = 'mm';
      var startDuration = 1;
      if (!data[0].balloon) {
        startDuration = 0;
      }
      var exportFields = ['active_calls', 'call_reject', 'timestamp'];
      var columnNames = {};
      if (cluster === vm.allClusters) {
        columnNames = {
          'active_calls': vm.callLocalTitle,
          'call_reject': vm.callRejectTitle,
          'timestamp': vm.timeStamp,
        };
      } else {
        columnNames = {
          'active_calls': vm.callLocalTitle,
          'call_reject': vm.callRedirectedClusterTitle,
          'timestamp': vm.timeStamp,
        };
      }
      cluster = _.replace(cluster, /\s/g, '_');
      var dateLabel = daterange.label;
      dateLabel = _.replace(dateLabel, /\s/g, '_');
      var ExportFileName = 'MediaService_TotalCalls_' + cluster + '_' + dateLabel + '_' + new Date();
      var chartData = CommonReportsGraphService.getBaseStackSerialGraph(data, startDuration, valueAxes, callVolumeGraphs(data, cluster, daterange), 'timestamp', catAxis, CommonReportsGraphService.getBaseExportForGraph(exportFields, ExportFileName, columnNames));
      chartData.numberFormatter = CommonReportsGraphService.getBaseVariable(vm.NUMFORMAT);
      chartData.legend = CommonReportsGraphService.getBaseVariable(vm.LEGEND);
      chartData.legend.labelText = '[[title]]';
      var chart = AmCharts.makeChart(vm.callVolumediv, chartData);
      // listen for zoomed event and call "handleZoom" method
      chart.addListener('zoomed', handleZoom);
      return chart;
    }

    // this method is called each time the selected period of the chart is changed
    function handleZoom(event) {
      vm.zoomedStartTime = event.startDate;
      vm.zoomedEndTime = event.endDate;
      var selectedTime = {
        startTime: vm.zoomedStartTime,
        endTime: vm.zoomedEndTime
      };

      if ((_.isUndefined(vm.dateSelected.value) && vm.zoomedStartTime !== vm.dateSelected.startTime && vm.zoomedEndTime !== vm.dateSelected.endTime) || (vm.zoomedStartTime !== vm.dateSelected.startTime && vm.zoomedEndTime !== vm.dateSelected.endTime)) {
        $rootScope.$broadcast('zoomedTime', {
          data: selectedTime
        });
      }
    }

    function callVolumeGraphs(data, cluster, daterange) {
      var colors = ['colorOne', 'colorTwo'];
      var values = ['active_calls', 'call_reject'];
      var secondaryColors = [data[0].colorOne, data[0].colorTwo];
      if (cluster === vm.allClusters) {
        vm.baloontitles = [vm.callLocalTitle, vm.callRejectTitle];
        vm.titles = [vm.legendcallLocalTitle, vm.legendcallRejectTitle];
      } else {
        vm.baloontitles = [vm.callLocalClusterTitle, vm.callRedirectedClusterTitle];
        vm.titles = [vm.legendcallLocalClusterTitle, vm.legendcallRedirectedClusterTitle];
      }
      var graphs = [];
      for (var i = 0; i < values.length; i++) {
        graphs.push(CommonReportsGraphService.getBaseVariable(vm.COLUMN));
        if (daterange.value === 0) {
          graphs[i].columnWidth = 0.5;
        } else {
          graphs[i].columnWidth = 4;
        }
        graphs[i].title = vm.titles[i];
        graphs[i].fillColors = colors[i];
        graphs[i].colorField = colors[i];
        graphs[i].valueField = values[i];
        graphs[i].legendColor = secondaryColors[i];
        graphs[i].showBalloon = data[0].balloon;
        if (cluster === vm.allClusters) {
          if (graphs[i].valueField === 'active_calls') {
            graphs[i].balloonText = '<span class="graph-text">' + $translate.instant(vm.baloontitles[i]) + ' <span class="graph-number">[[active_calls]]</span></span>';
          } else {
            graphs[i].balloonText = '<span class="graph-text">' + $translate.instant(vm.baloontitles[i]) + ' <span class="graph-number">[[call_reject]]</span></span>';
          }
        } else {
          if (graphs[i].valueField === 'active_calls') {
            graphs[i].balloonText = '<span class="graph-text">' + $translate.instant(vm.baloontitles[i]) + '\n' + cluster + ':' + ' <span class="graph-number">[[active_calls]]</span></span>';
          } else {
            graphs[i].balloonText = '<span class="graph-text">' + $translate.instant(vm.baloontitles[i]) + '\n' + cluster + ':' + ' <span class="graph-number">[[call_reject]]</span></span>';
          }
        }
        graphs[i].showHandOnHover = true;
        graphs[i].clustered = false;
      }
      return graphs;
    }

  }
})();
