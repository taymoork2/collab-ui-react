(function () {
  'use strict';
  angular.module('Mediafusion').service('MetricsGraphService', MetricsGraphService);
  /* @ngInject */
  function MetricsGraphService($translate, CommonMetricsGraphService, chartColors) {
    // Keys for base variables in CommonMetricsGraphService
    var COLUMN = 'column';
    var AXIS = 'axis';
    var LEGEND = 'legend';
    var NUMFORMAT = 'numFormat';
    // variables for the call volume section
    var callVolumediv = 'callVolumediv';
    // var callVolumeBalloonText = '<span class="graph-text">' + $translate.instant('activeUsers.registeredUsers') + ' <span class="graph-number">[[totalRegisteredUsers]]</span></span><br><span class="graph-text">' + $translate.instant('activeUsers.active') + ' <span class="graph-number">[[percentage]]%</span></span>';
    var callLocalTitle = $translate.instant('mediaFusion.metrics.callLocal');
    var callRejectTitle = $translate.instant('mediaFusion.metrics.callReject');
    //availablility variable
    var availabilitydiv = 'availabilitydiv';
    var clusterAvailableTitle = $translate.instant('mediaFusion.metrics.clusterAvailableTitle');
    var clusterUnavailableTitle = $translate.instant('mediaFusion.metrics.clusterUnavailableTitle');
    var clusterPartialTitle = $translate.instant('mediaFusion.metrics.clusterPartialTitle');
    var hostAvailableTitle = $translate.instant('mediaFusion.metrics.hostAvailableTitle');
    var hostUnavailableTitle = $translate.instant('mediaFusion.metrics.hostUnavailableTitle');
    return {
      setCallVolumeGraph: setCallVolumeGraph,
      setAvailabilityGraph: setAvailabilityGraph
    };

    function createCallVolumeGraph(data) {
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
      //catAxis.parseDates = true;
      catAxis.dataDateFormat = 'YYYY-MM-DDTJJ:NN:SS.QQQZ';
      catAxis.parseDates = true;
      catAxis.startOnAxis = true;
      //catAxis.equalSpacing = true;
      catAxis.axisAlpha = 0.5;
      catAxis.axisColor = '#1C1C1C';
      catAxis.gridAlpha = 0.1;
      catAxis.minorGridAlpha = 0.1;
      catAxis.minorGridEnabled = false;
      catAxis.dateFormats = [{
        fff: 'period',
        format: 'JJ:NN:SS'
      }, {
        period: 'ss',
        format: 'JJ:NN:SS'
      }, {
        period: 'mm',
        format: 'JJ:NN'
      }, {
        period: 'hh',
        format: 'JJ:NN'
      }, {
        period: 'DD',
        format: 'MM/DD/YYYY'
      }, {
        period: 'WW',
        format: 'MM/W/YYYY'
      }, {
        period: 'MM',
        format: 'MMM YYYY'
      }, {
        period: 'YYYY',
        format: 'YYYY'
      }];
      //catAxis.minimum = true;
      catAxis.minPeriod = "mm";
      //catAxis.twoLineMode = true;
      var startDuration = 1;
      if (!data[0].balloon) {
        startDuration = 0;
      }
      var chartData = CommonMetricsGraphService.getBaseStackSerialGraph(data, startDuration, valueAxes, callVolumeGraphs(data), 'timestamp', catAxis);
      chartData.numberFormatter = CommonMetricsGraphService.getBaseVariable(NUMFORMAT);
      chartData.legend = CommonMetricsGraphService.getBaseVariable(LEGEND);
      chartData.legend.labelText = '[[title]]';
      //chartData.dataDateFormat = 'YYYY-MM-DDTJJ:NN:SS.QQQZ';
      var chart = AmCharts.makeChart(callVolumediv, chartData);
      chart.addListener("rendered", zoomChart);
      zoomChart(chart);
      return chart;
    }

    function zoomChart(chart) {
      chart.zoomToIndexes(chart.dataProvider.length - 40, chart.dataProvider.length - 1);
    }

    function callVolumeGraphs(data) {
      var colors = ['colorOne', 'colorTwo'];
      var secondaryColors = [data[0].colorOne, data[0].colorTwo];
      var values = ['active_calls', 'call_reject'];
      var titles = [callLocalTitle, callRejectTitle];
      var graphs = [];
      for (var i = 0; i < values.length; i++) {
        graphs.push(CommonMetricsGraphService.getBaseVariable(COLUMN));
        graphs[i].title = titles[i];
        graphs[i].fillColors = colors[i];
        graphs[i].colorField = colors[i];
        graphs[i].legendColor = secondaryColors[i];
        graphs[i].valueField = values[i];
        //graphs[i].showBalloon = data[0].balloon;
        graphs[i].showBalloon = data[0].balloon;
        if (graphs[i].valueField === 'active_calls') {
          graphs[i].balloonText = '<span class="graph-text">' + $translate.instant(titles[i]) + ' <span class="graph-number">[[active_calls]]</span></span>';
        } else {
          graphs[i].balloonText = '<span class="graph-text">' + $translate.instant(titles[i]) + ' <span class="graph-number">[[call_reject]]</span></span>';
        }
        graphs[i].clustered = false;
      }
      return graphs;
    }

    function setCallVolumeGraph(data, callVolumeChart) {
      if (data === null || data === 'undefined' || data.length === 0) {
        return;
      } else if (callVolumeChart !== null && angular.isDefined(callVolumeChart)) {
        var startDuration = 1;
        if (!data[0].balloon) {
          startDuration = 0;
        }
        callVolumeChart.dataProvider = data;
        callVolumeChart.graphs = callVolumeGraphs(data);
        callVolumeChart.startDuration = startDuration;
        callVolumeChart.validateData();
        return callVolumeChart;
      } else {
        callVolumeChart = createCallVolumeGraph(data);
        callVolumeChart.dataProvider = data;
        callVolumeChart.graphs = callVolumeGraphs(data);
        callVolumeChart.startDuration = startDuration;
        callVolumeChart.validateData();
        return callVolumeChart;
      }
    }

    function createLegendsForAvailabilty(selectedCluster) {
      var legendData = [];
      if (selectedCluster == 'All') {
        var length = 3;
        var titles = [clusterAvailableTitle, clusterUnavailableTitle, clusterPartialTitle];
        var colors = [chartColors.colorGreen, chartColors.colorRed, chartColors.colorYellow];
      } else {
        var length = 2;
        var titles = [hostAvailableTitle, hostUnavailableTitle];
        var colors = [chartColors.colorGreen, chartColors.colorRed];
      }
      for (var i = 0; i < length; i++) {
        var legend = {};
        legendData.push(legend);
        legendData[i].title = titles[i];
        legendData[i].color = colors[i];
      }
      //      var legend = new AmCharts.AmLegend();
      //     legend.align = 'right';
      //    legend.position = 'top';
      //   legend.data = legendData;
      return legendData;
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

    function createAvailabilityGraph(data, selectedCluster) {
      // if there are no active users for this user
      if (data === null || data === 'undefined' || data.length === 0) {
        return;
      }
      var legend = createLegendsForAvailabilty(selectedCluster);
      var valueAxis = createValueAxis(data);
      var chartData = CommonMetricsGraphService.getGanttGraph(data.data[0].clusterCategories, valueAxis, legend);
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
      }
      /*             else if (availabilityChart !== null && angular.isDefined(availabilityChart)) {
                          availabilityChart.dataProvider = data.data[0].clusterCategories;
                          var legend = createLegendsForAvailabilty(selectedCluster);
                          var valueAxis = createValueAxis(data);
                          availabilityChart.valueAxis = valueAxis;
                          availabilityChart.period = data.data[0].period;
                          availabilityChart.startDate = startDate;
                          availabilityChart.legend.data=legend;
                          availabilityChart.validateData();
                          return availabilityChart;
                        }*/
      else {
        availabilityChart = createAvailabilityGraph(data, selectedCluster);
        availabilityChart.period = data.data[0].period;
        availabilityChart.startDate = startDate;
        availabilityChart.validateData();
        return availabilityChart;
      }
    }
  }
})();
