(function () {
  'use strict';

  angular.module('Mediafusion').service('MetricsGraphServiceV2', MetricsGraphServiceV2);
  /* @ngInject */
  function MetricsGraphServiceV2($translate, CommonMetricsGraphServiceV2, chartColors, $window, $rootScope) {
    // Keys for base variables in CommonMetricsGraphServiceV2
    var COLUMN = 'column';
    var AXIS = 'axis';
    var NUMFORMAT = 'numFormat';
    var GUIDEAXIS = 'guideaxis';
    var LEGEND = 'legend';
    var CHARTSCROLLBAR = 'chartScrollbar';
    var VALUESCROLLBAR = 'valueScrollbar';
    var chartScrollbar = null;
    var valueScrollbar = null;
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
    //availablility variable
    var availableTitle = $translate.instant('mediaFusion.metrics.availableTitle');
    var unavailableTitle = $translate.instant('mediaFusion.metrics.unavailableTitle');
    var partialTitle = $translate.instant('mediaFusion.metrics.partialTitle');
    var average_utilzation = $translate.instant('mediaFusion.metrics.avgutilization');
    var historicalAvailabilitydiv = 'historicalAvailabilitydiv';
    var realtimeavailabilitydiv = 'realtimeavailabilitydiv';
    var historicalUtilizationdiv = 'historicalUtilizationdiv';
    var realtimeutilizationdiv = 'realtimeutilizationdiv';
    var historicalCallVolumediv = 'historicalCallVolumediv';
    var realTimeCallVolumediv = 'realTimeCallVolumediv';
    var baseVariables = [];
    var baloontitles = [];
    var titles = [];
    var allClusters = $translate.instant('mediaFusion.metrics.allclusters');
    var timeStamp = $translate.instant('mediaFusion.metrics.timeStamp');
    var startTime = $translate.instant('mediaFusion.metrics.startTime');
    var endTime = $translate.instant('mediaFusion.metrics.endTime');
    var nodes = $translate.instant('mediaFusion.metrics.nodes');
    var node = $translate.instant('mediaFusion.metrics.node');
    var availabilityStatus = $translate.instant('mediaFusion.metrics.availabilityStatus');
    var availabilityOfHost = $translate.instant('mediaFusion.metrics.availabilityOfHost');
    var clusterTitle = $translate.instant('mediaFusion.metrics.clusterTitle');
    var availabilityLegendCluster = [{ 'title': availableTitle, 'color': chartColors.metricDarkGreen }, { 'title': unavailableTitle, 'color': chartColors.metricsRed }];
    var availabilityLegendAllcluster = [{ 'title': availableTitle, 'color': chartColors.metricDarkGreen }, { 'title': unavailableTitle, 'color': chartColors.metricsRed }, { 'title': partialTitle, 'color': chartColors.metricYellow }];

    return {
      setUtilizationGraph: setUtilizationGraph,
      setCallVolumeGraph: setCallVolumeGraph,
      setAvailabilityGraph: setAvailabilityGraph
    };

    function getBaseExportForGraph(fields, fileName, columnNames) {
      baseVariables['export'] = {
        'enabled': true,
        'exportFields': fields,
        'columnNames': columnNames,
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
            'menu': ['PNG', 'JPG']
          }, {
            'label': $translate.instant('reportsPage.pdf'),
            'title': $translate.instant('reportsPage.pdf'),
            click: function () {
              this.capture({}, function () {
                this.toPDF({}, function (data) {
                  $window.open(data, 'amCharts.pdf');
                });
              });
            }
          }, {
            'class': 'export-list',
            'label': $translate.instant('reportsPage.export'),
            'title': $translate.instant('reportsPage.export'),
            'menu': ['CSV', 'XLSX']
          }]
        }]
      };
      return baseVariables['export'];
    }

    function createCallVolumeGraph(data, cluster, daterange, displayHistorical) {
      // if there are no active users for this user
      if (data === null || data === 'undefined' || data.length === 0) {
        return;
      }
      var valueAxes = [CommonMetricsGraphServiceV2.getBaseVariable(AXIS)];
      valueAxes[0].integersOnly = true;
      valueAxes[0].axisAlpha = 0.5;
      valueAxes[0].axisColor = '#1C1C1C';
      valueAxes[0].minimum = 0;
      valueAxes[0].autoGridCount = true;
      valueAxes[0].stackType = 'regular';
      var catAxis = CommonMetricsGraphServiceV2.getBaseVariable(AXIS);
      catAxis.gridPosition = 'start';
      catAxis.parseDates = true;
      catAxis.startOnAxis = true;
      catAxis.axisAlpha = 0.5;
      catAxis.axisColor = '#1C1C1C';
      catAxis.gridAlpha = 0.3;
      catAxis.minorGridAlpha = 0.1;
      catAxis.minorGridEnabled = false;
      catAxis.minPeriod = 'mm';
      var startDuration = 1;
      if (!data[0].balloon) {
        startDuration = 0;
      }
      if (displayHistorical) {
        chartScrollbar = CommonMetricsGraphServiceV2.getBaseVariable(CHARTSCROLLBAR);
      } else {
        chartScrollbar = null;
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
      daterange = _.replace(daterange, /\s/g, '_');
      var ExportFileName = 'MediaService_TotalCalls_' + cluster + '_' + daterange + '_' + new Date();
      var chartData = CommonMetricsGraphServiceV2.getBaseStackSerialGraph(data, startDuration, valueAxes, callVolumeGraphs(data, cluster), 'timestamp', catAxis, getBaseExportForGraph(exportFields, ExportFileName, columnNames), chartScrollbar);
      chartData.numberFormatter = CommonMetricsGraphServiceV2.getBaseVariable(NUMFORMAT);
      chartData.legend = CommonMetricsGraphServiceV2.getBaseVariable(LEGEND);
      chartData.legend.labelText = '[[title]]';

      var chart = null;
      if (displayHistorical) {
        chart = AmCharts.makeChart(historicalCallVolumediv, chartData);
      } else {
        chart = AmCharts.makeChart(realTimeCallVolumediv, chartData);
      }

      chart.addListener('rendered', zoomChart);
      zoomChart(chart);
      return chart;
    }

    function zoomChart(chart) {
      chart.zoomToIndexes(chart.dataProvider.length - 40, chart.dataProvider.length - 1);
    }

    function callVolumeGraphs(data, cluster, displayHistorical) {
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
        graphs.push(CommonMetricsGraphServiceV2.getBaseVariable(COLUMN));
        if (displayHistorical) {
          graphs[i].columnWidth = 4;
        } else {
          graphs[i].columnWidth = 0.5;
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

    function setCallVolumeGraph(data, callVolumeChart, cluster, daterange, displayHistorical) {
      if (data === null || data === 'undefined' || data.length === 0) {
        return;
      } else if (callVolumeChart !== null && !_.isUndefined(callVolumeChart)) {
        var startDuration = 0;
        if (displayHistorical) {
          startDuration = 1;
          if (!data[0].balloon) {
            startDuration = 0;
          }
        } else {
          startDuration = 0;
          if (!data[0].balloon) {
            startDuration = 0;
          }
        }
        callVolumeChart = createCallVolumeGraph(data, cluster, daterange, displayHistorical);
        callVolumeChart.dataProvider = data;
        callVolumeChart.graphs = callVolumeGraphs(data, cluster, displayHistorical);
        callVolumeChart.startDuration = startDuration;
        callVolumeChart.validateData();
        return callVolumeChart;
      } else {
        callVolumeChart = createCallVolumeGraph(data, cluster, daterange, displayHistorical);
        callVolumeChart.dataProvider = data;
        callVolumeChart.graphs = callVolumeGraphs(data, cluster, displayHistorical);
        callVolumeChart.startDuration = startDuration;
        callVolumeChart.validateData();
        return callVolumeChart;
      }
    }

    function createutilizationGraph(data, graphs, cluster, daterange, displayHistorical) {
      if (data === null || data === 'undefined' || data.length === 0) {
        return;
      }
      var valueAxes = [CommonMetricsGraphServiceV2.getBaseVariable(GUIDEAXIS)];
      valueAxes[0].integersOnly = true;
      valueAxes[0].axisAlpha = 0.5;
      valueAxes[0].axisColor = '#1C1C1C';
      valueAxes[0].minimum = 0;
      valueAxes[0].maximum = 100;
      valueAxes[0].autoGridCount = true;
      valueAxes[0].position = 'left';
      valueAxes[0].title = '%';
      valueAxes[0].titleRotation = 180;

      var catAxis = CommonMetricsGraphServiceV2.getBaseVariable(AXIS);
      catAxis.gridPosition = 'start';
      catAxis.dataDateFormat = 'YYYY-MM-DDTJJ:NN:SS.QQQZ';
      catAxis.parseDates = true;
      catAxis.axisAlpha = 0.5;
      catAxis.axisColor = '#1C1C1C';
      catAxis.gridAlpha = 0.1;
      catAxis.minorGridAlpha = 0.1;
      catAxis.minorGridEnabled = false;
      var dateLabel = daterange.label;
      var dateValue = daterange.value;

      if (dateValue === 0) {
        catAxis.minPeriod = '10mm';
      } else if (dateValue === 1) {
        catAxis.minPeriod = 'hh';
      } else if (dateValue === 2) {
        catAxis.minPeriod = '3hh';
      } else if (dateValue === 3) {
        catAxis.minPeriod = '8hh';
      } else if (dateValue === 4) {
        catAxis.minPeriod = '1mm';
      }

      var startDuration = 1;
      if (!data[0].balloon) {
        startDuration = 0;
      }
      if (displayHistorical) {
        chartScrollbar = CommonMetricsGraphServiceV2.getBaseVariable(CHARTSCROLLBAR);
      } else {
        chartScrollbar = null;
      }
      var columnNames = {
        'time': timeStamp
      };
      var exportFields = [];
      _.forEach(graphs, function (value) {
        if (value.title !== average_utilzation) {
          columnNames[value.valueField] = value.title + ' ' + 'Utilization';
        } else {
          columnNames[value.valueField] = value.title;
        }
      });
      for (var key in columnNames) {
        exportFields.push(key);
      }
      cluster = _.replace(cluster, /\s/g, '_');
      dateLabel = _.replace(dateLabel, /\s/g, '_');
      var ExportFileName = 'MediaService_Utilization_' + cluster + '_' + dateLabel + '_' + new Date();

      var chartData = CommonMetricsGraphServiceV2.getBaseStackSerialGraph(data, startDuration, valueAxes, graphs, 'time', catAxis, getBaseExportForGraph(exportFields, ExportFileName, columnNames), chartScrollbar);
      chartData.legend = CommonMetricsGraphServiceV2.getBaseVariable(LEGEND);
      chartData.legend.labelText = '[[title]]';
      chartData.legend.useGraphSettings = true;

      var chart = null;
      if (displayHistorical) {
        chart = AmCharts.makeChart(historicalUtilizationdiv, chartData);
      } else {
        chart = AmCharts.makeChart(realtimeutilizationdiv, chartData);
      }

      chart.addListener('rendered', zoomChart);
      zoomChart(chart);
      return chart;
    }

    function setUtilizationGraph(data, graphs, utilizationChart, cluster, daterange, displayHistorical) {

      var isDummy = false;
      if (data === null || data === 'undefined' || data.length === 0) {
        return;
      } else if (utilizationChart !== null && !_.isUndefined(utilizationChart)) {
        if (data[0].colorTwo === chartColors.dummyGray) {
          isDummy = true;
        }
        var startDuration = 1;
        if (!data[0].balloon) {
          startDuration = 0;
        }
        utilizationChart = createutilizationGraph(data, graphs, cluster, daterange, displayHistorical);
        utilizationChart.dataProvider = data;
        utilizationChart.graphs = graphs;
        utilizationChart.startDuration = startDuration;
        utilizationChart.balloon.enabled = true;
        utilizationChart.chartCursor.valueLineBalloonEnabled = true;
        utilizationChart.chartCursor.valueLineEnabled = true;
        utilizationChart.chartCursor.categoryBalloonEnabled = true;
        utilizationChart.chartCursor.oneBalloonOnly = true;
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

        utilizationChart = createutilizationGraph(data, graphs, cluster, daterange, displayHistorical);
        utilizationChart.dataProvider = data;
        utilizationChart.graphs = graphs;
        utilizationChart.startDuration = startDuration;
        utilizationChart.balloon.enabled = true;
        utilizationChart.chartCursor.valueLineBalloonEnabled = true;
        utilizationChart.chartCursor.valueLineEnabled = true;
        utilizationChart.chartCursor.valueBalloonsEnabled = true;
        utilizationChart.chartCursor.oneBalloonOnly = true;
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
      endTime = convertToLocalTime(endTime);
      var startTime = data.data[0].startTime;
      startTime = convertToLocalTime(startTime);

      var valueAxis = CommonMetricsGraphServiceV2.getBaseVariable(AXIS);
      valueAxis.maximumDate = endTime;
      valueAxis.minimumDate = startTime;
      valueAxis.type = 'date';
      return valueAxis;
    }

    function createAvailabilityGraph(data, selectedCluster, cluster, daterange, displayHistorical) {
      // if there are no active users for this user
      if (data === null || data === 'undefined' || data.length === 0) {
        return;
      }
      var legend;
      if (selectedCluster === allClusters) {
        legend = angular.copy(availabilityLegendAllcluster);
      } else {
        legend = angular.copy(availabilityLegendCluster);
      }
      if (!_.isUndefined(data.data[0].isDummy) && data.data[0].isDummy) {
        _.forEach(legend, function (value, key) {
          legend[key].color = '#AAB3B3';
        });
      }
      var valueAxis = createValueAxis(data);
      var catAxes = CommonMetricsGraphServiceV2.getBaseVariable(AXIS);
      catAxes.listeners = [{
        "event": "clickItem",
        "method": function (event) {
          $rootScope.$broadcast('clusterClickEvent', {
            data: event.value
          });
        }
      }];
      var exportFields = ['startTime', 'endTime', 'nodes', 'availability', 'category'];
      var columnNames = {};
      if (cluster === allClusters) {
        columnNames = {
          'startTime': startTime,
          'endTime': endTime,
          'nodes': nodes,
          'availability': availabilityStatus,
          'category': clusterTitle,
        };
      } else {
        columnNames = {
          'availability': availabilityOfHost,
          'startTime': startTime,
          'endTime': endTime,
          'category': node,
        };
      }
      cluster = _.replace(cluster, /\s/g, '_');
      daterange = _.replace(daterange, /\s/g, '_');
      if (displayHistorical) {
        valueScrollbar = CommonMetricsGraphServiceV2.getBaseVariable(VALUESCROLLBAR);
      } else {
        valueScrollbar = null;
      }
      var ExportFileName = 'MediaService_Availability_' + cluster + '_' + daterange + '_' + new Date();
      var chartData = CommonMetricsGraphServiceV2.getGanttGraph(data.data[0].clusterCategories, valueAxis, getBaseExportForGraph(exportFields, ExportFileName, columnNames), catAxes, valueScrollbar);
      chartData.legend = CommonMetricsGraphServiceV2.getBaseVariable(LEGEND);
      chartData.legend.labelText = '[[title]]';
      chartData.legend.data = legend;
      chartData.graph.showHandOnHover = true;
      chartData.listeners = [{
        "event": "clickGraphItem",
        "method": function (event) {
          $rootScope.$broadcast('clusterClickEvent', {
            data: event.item.category
          });
        }
      }];
      var chart = null;
      if (displayHistorical) {
        chart = AmCharts.makeChart(historicalAvailabilitydiv, chartData);
      } else {
        chart = AmCharts.makeChart(realtimeavailabilitydiv, chartData);
      }
      return chart;
    }

    function convertToLocalTime(startDate) {
      var localTime = moment.utc(startDate, 'YYYY-MM-DDTHH:mm:ssZ');
      localTime = moment.utc(localTime).toDate();
      localTime = moment(localTime);
      return localTime;
    }

    function setAvailabilityGraph(data, availabilityChart, selectedCluster, cluster, daterange, displayHistorical) {
      var startDate = data.data[0].startTime;
      startDate = convertToLocalTime(startDate);
      if (data === null || data === 'undefined' || data.length === 0) {
        return;
      } else {
        availabilityChart = createAvailabilityGraph(data, selectedCluster, cluster, daterange, displayHistorical);
        availabilityChart.period = data.data[0].period;
        availabilityChart.startDate = startDate;
        availabilityChart.validateData();
        return availabilityChart;
      }
    }
  }
})();
