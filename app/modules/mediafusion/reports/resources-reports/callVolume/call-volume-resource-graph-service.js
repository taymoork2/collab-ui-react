(function () {
  'use strict';

  angular.module('Mediafusion').service('CallVolumeResourceGraphService', CallVolumeResourceGraphService);
  /* @ngInject */
  function CallVolumeResourceGraphService(CommonReportsGraphService, $translate) {

    var callVolumediv = 'callVolumediv';
    var COLUMN = 'column';
    var AXIS = 'axis';
    var NUMFORMAT = 'numFormat';
    var LEGEND = 'legend';
    var titles = [];
    var baloontitles = [];

    var allClusters = $translate.instant('mediaFusion.metrics.allclusters');
    var timeStamp = $translate.instant('mediaFusion.metrics.timeStamp');
    // variables for the call volume section
    var callLocalTitle = $translate.instant('mediaFusion.metrics.callLocal');
    var callRejectTitle = $translate.instant('mediaFusion.metrics.callReject');
    var callLocalClusterTitle = $translate.instant('mediaFusion.metrics.callLocalCluster');
    var callRedirectedClusterTitle = $translate.instant('mediaFusion.metrics.callRedirectedCluster');
    //legendtexts
    var legendcallLocalTitle = $translate.instant('mediaFusion.metrics.legendcallLocal');
    var legendcallRejectTitle = $translate.instant('mediaFusion.metrics.legendcallReject');
    var legendcallLocalClusterTitle = $translate.instant('mediaFusion.metrics.legendcallLocalCluster');
    var legendcallRedirectedClusterTitle = $translate.instant('mediaFusion.metrics.legendcallRedirectedCluster');

    return {
      setCallVolumeGraph: setCallVolumeGraph
    };

    function setCallVolumeGraph(data, callVolumeChart, cluster, daterange) {
      if (data === null || data === 'undefined' || data.length === 0) {
        return;
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
      var valueAxes = [CommonReportsGraphService.getBaseVariable(AXIS)];
      valueAxes[0].integersOnly = true;
      valueAxes[0].axisAlpha = 0.5;
      valueAxes[0].axisColor = '#1C1C1C';
      valueAxes[0].minimum = 0;
      valueAxes[0].autoGridCount = true;
      valueAxes[0].stackType = 'regular';
      var catAxis = CommonReportsGraphService.getBaseVariable(AXIS);
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
      if (cluster === allClusters) {
        columnNames = {
          'active_calls': callLocalTitle,
          'call_reject': callRejectTitle,
          'timestamp': timeStamp,
        };
      } else {
        columnNames = {
          'active_calls': callLocalTitle,
          'call_reject': callRedirectedClusterTitle,
          'timestamp': timeStamp,
        };
      }
      cluster = _.replace(cluster, /\s/g, '_');
      var dateLabel = daterange.label;
      dateLabel = _.replace(dateLabel, /\s/g, '_');
      var ExportFileName = 'MediaService_TotalCalls_' + cluster + '_' + dateLabel + '_' + new Date();
      var chartData = CommonReportsGraphService.getBaseStackSerialGraph(data, startDuration, valueAxes, callVolumeGraphs(data, cluster, daterange), 'timestamp', catAxis, CommonReportsGraphService.getBaseExportForGraph(exportFields, ExportFileName, columnNames));
      chartData.numberFormatter = CommonReportsGraphService.getBaseVariable(NUMFORMAT);
      chartData.legend = CommonReportsGraphService.getBaseVariable(LEGEND);
      chartData.legend.labelText = '[[title]]';
      var chart = AmCharts.makeChart(callVolumediv, chartData);
      chart.addListener('rendered', zoomChart);
      zoomChart(chart);
      return chart;
    }

    function zoomChart(chart) {
      chart.zoomToIndexes(chart.dataProvider.length - 40, chart.dataProvider.length - 1);
    }

    function callVolumeGraphs(data, cluster, daterange) {
      var colors = ['colorOne', 'colorTwo'];
      var values = ['active_calls', 'call_reject'];
      var secondaryColors = [data[0].colorOne, data[0].colorTwo];
      if (cluster === 'All Clusters') {
        baloontitles = [callLocalTitle, callRejectTitle];
        titles = [legendcallLocalTitle, legendcallRejectTitle];
      } else {
        baloontitles = [callLocalClusterTitle, callRedirectedClusterTitle];
        titles = [legendcallLocalClusterTitle, legendcallRedirectedClusterTitle];
      }
      var graphs = [];
      for (var i = 0; i < values.length; i++) {
        graphs.push(CommonReportsGraphService.getBaseVariable(COLUMN));
        if (daterange.value === 0) {
          graphs[i].columnWidth = 0.5;
        } else {
          graphs[i].columnWidth = 4;
        }
        graphs[i].title = titles[i];
        graphs[i].fillColors = colors[i];
        graphs[i].colorField = colors[i];
        graphs[i].valueField = values[i];
        graphs[i].legendColor = secondaryColors[i];
        graphs[i].showBalloon = data[0].balloon;
        if (cluster === allClusters) {
          if (graphs[i].valueField === 'active_calls') {
            graphs[i].balloonText = '<span class="graph-text">' + $translate.instant(baloontitles[i]) + ' <span class="graph-number">[[active_calls]]</span></span>';
          } else {
            graphs[i].balloonText = '<span class="graph-text">' + $translate.instant(baloontitles[i]) + ' <span class="graph-number">[[call_reject]]</span></span>';
          }
        } else {
          if (graphs[i].valueField === 'active_calls') {
            graphs[i].balloonText = '<span class="graph-text">' + $translate.instant(baloontitles[i]) + '\n' + cluster + ':' + ' <span class="graph-number">[[active_calls]]</span></span>';
          } else {
            graphs[i].balloonText = '<span class="graph-text">' + $translate.instant(baloontitles[i]) + '\n' + cluster + ':' + ' <span class="graph-number">[[call_reject]]</span></span>';
          }
        }
        graphs[i].clustered = false;
      }
      return graphs;
    }

  }
})();
