(function () {
  'use strict';
  angular.module('Mediafusion').service('MetricsGraphService', MetricsGraphService);
  /* @ngInject */
  function MetricsGraphService($translate, CommonMetricsGraphService, chartColors, $log) {
    // Keys for base variables in CommonMetricsGraphService
    var COLUMN = 'column';
    var AXIS = 'axis';
    var NUMFORMAT = 'numFormat';
    var SMOOTHLINED = 'smoothedLine';
    var GUIDEAXIS = 'guideaxis';
    // variables for the call volume section
    var callVolumediv = 'callVolumediv';
    // var callVolumeBalloonText = '<span class="graph-text">' + $translate.instant('activeUsers.registeredUsers') + ' <span class="graph-number">[[totalRegisteredUsers]]</span></span><br><span class="graph-text">' + $translate.instant('activeUsers.active') + ' <span class="graph-number">[[percentage]]%</span></span>';
    var callLocalTitle = $translate.instant('mediaFusion.metrics.callLocal');
    var callRejectTitle = $translate.instant('mediaFusion.metrics.callReject');
    var callLocalClusterTitle = $translate.instant('mediaFusion.metrics.callLocalCluster');
    var callRedirectedClusterTitle = $translate.instant('mediaFusion.metrics.callRedirectedCluster');
    //availablility variable
    var availabilitydiv = 'availabilitydiv';
    var utilizationdiv = 'utilizationdiv';
    //variables for utilization graph
    var peakUtilization = $translate.instant('mediaFusion.metrics.peakutilization');
    var averageUtilization = $translate.instant('mediaFusion.metrics.averageutilization');
    var baseVariables = [];
    var titles = [];

    return {
      setUtilizationGraph: setUtilizationGraph,
      setCallVolumeGraph: setCallVolumeGraph,
      setAvailabilityGraph: setAvailabilityGraph
    };

    function getBaseExportForSerialGraph(fields, fileName) {
      baseVariables['export'] = {
        'enabled': true,
        'exportFields': fields,
        'fileName': fileName,
        'libs': {
          'autoLoad': false
        },
        'menu': [{
          'class': 'export-main',
          'label': $translate.instant('reportsPage.downloadOptions'),
          'menu': [{
            'label': $translate.instant('reportsPage.saveAs'),
            'title': $translate.instant('reportsPage.saveAs'),
            'class': 'export-list',
            'menu': ['PNG', 'JPG', 'PDF']
          }, 'PRINT', {
            'class': 'export-list',
            'label': 'Export',
            'title': 'Export',
            'menu': ['CSV']
          }]
        }]
      };
      return baseVariables['export'];
    }

    function createCallVolumeGraph(data, cluster, daterange) {
      // if there are no active users for this user
      if (data === null || data === 'undefined' || data.length === 0) {
        return;
      }
      var valueAxes = [CommonMetricsGraphService.getBaseVariable(AXIS)];
      valueAxes[0].integersOnly = true;
      valueAxes[0].axisAlpha = 0.5;
      valueAxes[0].axisColor = '#1C1C1C';
      valueAxes[0].minimum = 0;
      valueAxes[0].autoGridCount = true;
      valueAxes[0].stackType = 'regular';
      var catAxis = CommonMetricsGraphService.getBaseVariable(AXIS);
      catAxis.gridPosition = 'start';
      //catAxis.dataDateFormat = 'YYYY-MM-DDTJJ:NN:SS.QQQZ';
      catAxis.parseDates = true;
      catAxis.startOnAxis = true;
      //catAxis.equalSpacing = true;
      catAxis.axisAlpha = 0.5;
      catAxis.axisColor = '#1C1C1C';
      catAxis.gridAlpha = 0.1;
      catAxis.minorGridAlpha = 0.1;
      catAxis.minorGridEnabled = false;
      catAxis.minPeriod = "mm";
      //catAxis.twoLineMode = true;
      var startDuration = 1;
      if (!data[0].balloon) {
        startDuration = 0;
      }
      var exportFields = ['call_reject', 'active_calls', 'timestamp'];
      cluster = cluster.replace(/\s/g, "_");
      daterange = daterange.replace(/\s/g, "_");
      var ExportFileName = 'CallVolume_' + cluster + '_' + daterange;
      var chartData = CommonMetricsGraphService.getBaseStackSerialGraph(data, startDuration, valueAxes, callVolumeGraphs(data, cluster), 'timestamp', catAxis, getBaseExportForSerialGraph(exportFields, ExportFileName));
      chartData.numberFormatter = CommonMetricsGraphService.getBaseVariable(NUMFORMAT);
      var chart = AmCharts.makeChart(callVolumediv, chartData);
      chart.addListener("rendered", zoomChart);
      zoomChart(chart);
      return chart;
    }

    function zoomChart(chart) {
      chart.zoomToIndexes(chart.dataProvider.length - 40, chart.dataProvider.length - 1);
    }

    function callVolumeGraphs(data, cluster) {
      var colors = ['colorOne', 'colorTwo'];
      var values = ['active_calls', 'call_reject'];
      if (cluster === 'All Clusters') {
        $log.log("a");
        titles = [callLocalTitle, callRejectTitle];
      } else {
        $log.log("b");
        titles = [callLocalClusterTitle, callRedirectedClusterTitle];
      }
      var graphs = [];
      for (var i = 0; i < values.length; i++) {
        graphs.push(CommonMetricsGraphService.getBaseVariable(COLUMN));
        graphs[i].title = titles[i];
        graphs[i].fillColors = colors[i];
        graphs[i].colorField = colors[i];
        graphs[i].valueField = values[i];
        //graphs[i].showBalloon = data[0].balloon;
        graphs[i].showBalloon = data[0].balloon;
        if (cluster === 'All Clusters') {
          if (graphs[i].valueField === 'active_calls') {
            graphs[i].balloonText = '<span class="graph-text">' + $translate.instant(titles[i]) + ' <span class="graph-number">[[active_calls]]</span></span>';
          } else {
            graphs[i].balloonText = '<span class="graph-text">' + $translate.instant(titles[i]) + ' <span class="graph-number">[[call_reject]]</span></span>';
          }
        } else {
          if (graphs[i].valueField === 'active_calls') {
            graphs[i].balloonText = '<span class="graph-text">' + $translate.instant(titles[i]) + '\n' + cluster + ';' + ' <span class="graph-number">[[active_calls]]</span></span>';
          } else {
            graphs[i].balloonText = '<span class="graph-text">' + $translate.instant(titles[i]) + '\n' + cluster + ';' + ' <span class="graph-number">[[call_reject]]</span></span>';
          }
        }
        graphs[i].clustered = false;
      }
      return graphs;
    }

    function setCallVolumeGraph(data, callVolumeChart, cluster, daterange) {
      if (data === null || data === 'undefined' || data.length === 0) {
        return;
      } else if (callVolumeChart !== null && angular.isDefined(callVolumeChart)) {
        var startDuration = 1;
        if (!data[0].balloon) {
          startDuration = 0;
        }
        callVolumeChart = createCallVolumeGraph(data, cluster, daterange);
        callVolumeChart.dataProvider = data;
        callVolumeChart.graphs = callVolumeGraphs(data, cluster);
        callVolumeChart.startDuration = startDuration;
        callVolumeChart.validateData();
        return callVolumeChart;
      } else {
        callVolumeChart = createCallVolumeGraph(data, cluster, daterange);
        callVolumeChart.dataProvider = data;
        callVolumeChart.graphs = callVolumeGraphs(data, cluster);
        callVolumeChart.startDuration = startDuration;
        callVolumeChart.validateData();
        return callVolumeChart;
      }
    }

    function createutilizationGraph(data, cluster, daterange) {
      if (data === null || data === 'undefined' || data.length === 0) {
        return;
      }
      var valueAxes = [CommonMetricsGraphService.getBaseVariable(GUIDEAXIS)];
      valueAxes[0].integersOnly = true;
      valueAxes[0].axisAlpha = 0.5;
      valueAxes[0].axisColor = '#1C1C1C';
      valueAxes[0].minimum = 0;
      valueAxes[0].maximum = 100;
      valueAxes[0].autoGridCount = true;
      valueAxes[0].position = 'left';
      valueAxes[0].title = '%';
      valueAxes[0].titleRotation = 180;
      //valueAxes[0].guides.label = 'Utilization High';

      var catAxis = CommonMetricsGraphService.getBaseVariable(AXIS);
      catAxis.gridPosition = 'start';
      catAxis.dataDateFormat = 'YYYY-MM-DDTJJ:NN:SS.QQQZ';
      catAxis.parseDates = true;
      catAxis.axisAlpha = 0.5;
      catAxis.axisColor = '#1C1C1C';
      catAxis.gridAlpha = 0.1;
      catAxis.minorGridAlpha = 0.1;
      catAxis.minorGridEnabled = false;
      catAxis.minPeriod = "mm";

      var startDuration = 1;
      if (!data[0].balloon) {
        startDuration = 0;
      }
      var exportFields = ['average_cpu', 'peak_cpu', 'timestamp'];
      cluster = cluster.replace(/\s/g, "_");
      daterange = daterange.replace(/\s/g, "_");
      var ExportFileName = 'Utilization_' + cluster + '_' + daterange;

      var chartData = CommonMetricsGraphService.getBaseStackSerialGraph(data, startDuration, valueAxes, utilizationGraphs(data), 'timestamp', catAxis, getBaseExportForSerialGraph(exportFields, ExportFileName));
      chartData.numberFormatter = CommonMetricsGraphService.getBaseVariable(NUMFORMAT);
      var chart = AmCharts.makeChart(utilizationdiv, chartData);
      chart.addListener("rendered", zoomChart);
      zoomChart(chart);
      return chart;
    }

    function utilizationGraphs(data) {
      var secondaryColors = [data[0].colorOne, data[0].colorTwo];
      var values = ['average_cpu', 'peak_cpu'];
      var titles = [averageUtilization, peakUtilization];
      var graphs = [];
      for (var i = 0; i < values.length; i++) {
        graphs.push(CommonMetricsGraphService.getBaseVariable(SMOOTHLINED));
        graphs[i].title = titles[i];
        graphs[i].lineColor = secondaryColors[i];
        graphs[i].negativeLineColor = secondaryColors[i];
        graphs[i].valueField = values[i];
        graphs[i].showBalloon = data[0].balloon;
        if (graphs[i].valueField === 'peak_cpu') {
          graphs[i].dashLength = 4;
          graphs[i].balloonText = '<span class="graph-text">' + $translate.instant(titles[i]) + ' <span class="graph-number">[[peak_cpu]]</span></span>';
        } else {
          graphs[i].balloonText = '<span class="graph-text">' + $translate.instant(titles[i]) + ' <span class="graph-number">[[average_cpu]]</span></span>';
        }
        graphs[i].clustered = false;
      }
      return graphs;
    }

    function setUtilizationGraph(data, utilizationChart, cluster, daterange) {

      var isDummy = false;
      if (data === null || data === 'undefined' || data.length === 0) {
        return;
      } else if (utilizationChart !== null && angular.isDefined(utilizationChart)) {
        if (data[0].colorTwo === chartColors.dummyGray) {
          isDummy = true;
        }
        var startDuration = 1;
        if (!data[0].balloon) {
          startDuration = 0;
        }
        utilizationChart = createutilizationGraph(data, cluster, daterange);
        utilizationChart.dataProvider = data;
        utilizationChart.graphs = utilizationGraphs(data);
        utilizationChart.startDuration = startDuration;
        utilizationChart.balloon.enabled = true;
        utilizationChart.chartCursor.valueLineBalloonEnabled = true;
        utilizationChart.chartCursor.valueLineEnabled = true;
        utilizationChart.chartCursor.categoryBalloonEnabled = true;
        if (isDummy) {
          utilizationChart.chartCursor.valueLineBalloonEnabled = false;
          utilizationChart.chartCursor.valueLineEnabled = false;
          utilizationChart.chartCursor.categoryBalloonEnabled = false;
          utilizationChart.balloon.enabled = false;
        }
        utilizationChart.validateData();
        return utilizationChart;
      } else {
        if (data[0].colorTwo === chartColors.dummyGray) {
          isDummy = true;
        }

        utilizationChart = createutilizationGraph(data, cluster, daterange);
        utilizationChart.dataProvider = data;
        utilizationChart.graphs = utilizationGraphs(data);
        utilizationChart.startDuration = startDuration;
        utilizationChart.balloon.enabled = true;
        utilizationChart.chartCursor.valueLineBalloonEnabled = true;
        utilizationChart.chartCursor.valueLineEnabled = true;
        utilizationChart.chartCursor.valueBalloonsEnabled = true;
        utilizationChart.chartCursor.balloonColor = chartColors.grayLight;
        if (isDummy) {
          utilizationChart.chartCursor.valueLineBalloonEnabled = false;
          utilizationChart.chartCursor.valueLineEnabled = false;
          utilizationChart.chartCursor.categoryBalloonEnabled = false;
          utilizationChart.balloon.enabled = false;
        }
        utilizationChart.validateData();
        return utilizationChart;
      }

    }

    function createValueAxis(data) {
      var endTime = data.data[0].endTime;
      //var endTime = str.substring(0, 10);
      endTime = convertToLocalTime(endTime);
      var startTime = data.data[0].startTime;
      startTime = convertToLocalTime(startTime);

      var valueAxis = CommonMetricsGraphService.getBaseVariable(AXIS);
      valueAxis.maximumDate = endTime;
      valueAxis.minimumDate = startTime;
      valueAxis.type = 'date';
      return valueAxis;
    }

    function createAvailabilityGraph(data) {
      // if there are no active users for this user
      if (data === null || data === 'undefined' || data.length === 0) {
        return;
      }
      var valueAxis = createValueAxis(data);
      var chartData = CommonMetricsGraphService.getGanttGraph(data.data[0].clusterCategories, valueAxis);
      var chart = AmCharts.makeChart(availabilitydiv, chartData);
      return chart;
    }

    function convertToLocalTime(startDate) {
      var localTime = moment.utc(startDate, 'YYYY-MM-DDTHH:mm:ssZ');
      localTime = moment.utc(localTime).toDate();
      localTime = moment(localTime);
      return localTime;
    }

    function setAvailabilityGraph(data, availabilityChart, selectedCluster) {
      var startDate = data.data[0].startTime;
      //var startDate = str.substring(0, 10);
      startDate = convertToLocalTime(startDate);
      if (data === null || data === 'undefined' || data.length === 0) {
        return;
      } else {
        availabilityChart = createAvailabilityGraph(data, selectedCluster);
        availabilityChart.period = data.data[0].period;
        availabilityChart.startDate = startDate;
        availabilityChart.validateData();
        return availabilityChart;
      }
    }
  }
})();
