(function () {
  'use strict';

  angular.module('Mediafusion').service('UtilizationResourceGraphService', UtilizationResourceGraphService);
  /* @ngInject */
  function UtilizationResourceGraphService(CommonReportsGraphService, chartColors, $translate) {

    var utilizationdiv = 'utilizationdiv';
    var GUIDEAXIS = 'guideaxis';
    var AXIS = 'axis';
    var LEGEND = 'legend';

    var timeStamp = $translate.instant('mediaFusion.metrics.timeStamp');
    var average_utilzation = $translate.instant('mediaFusion.metrics.avgutilization');
    var allClusters = $translate.instant('mediaFusion.metrics.allclusters');
    var utilization = $translate.instant('mediaFusion.metrics.utilization');

    return {
      setUtilizationGraph: setUtilizationGraph
    };

    function setUtilizationGraph(response, utilizationChart, clusterSelected, clusterId, daterange, clusterMap) {
      var isDummy = false;
      var data = response.graphData;
      var graphs = getClusterName(response.graphs, clusterMap, clusterSelected, clusterId);
      if (data === null || data === 'undefined' || data.length === 0) {
        return;
      } else {
        if (data[0].colorTwo === chartColors.dummyGray) {
          isDummy = true;
        }
        var startDuration = 1;
        if (!data[0].balloon) {
          startDuration = 0;
        }

        utilizationChart = createutilizationGraph(data, graphs, clusterSelected, daterange);
        utilizationChart.dataProvider = data;
        utilizationChart.graphs = graphs;
        utilizationChart.startDuration = startDuration;
        utilizationChart.balloon.enabled = true;
        utilizationChart.chartCursor.valueLineBalloonEnabled = true;
        utilizationChart.chartCursor.valueLineEnabled = true;
        utilizationChart.chartCursor.categoryBalloonEnabled = true;
        utilizationChart.chartCursor.oneBalloonOnly = true;
        utilizationChart.chartCursor.balloonColor = chartColors.grayLight;
        utilizationChart.chartCursor.valueBalloonsEnabled = true;
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

    function createutilizationGraph(data, graphs, clusterSelected, daterange) {
      if (data === null || data === 'undefined' || data.length === 0) {
        return;
      }
      var valueAxes = [CommonReportsGraphService.getBaseVariable(GUIDEAXIS)];
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

      var catAxis = CommonReportsGraphService.getBaseVariable(AXIS);
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
        catAxis.minPeriod = '1mm';
      } else if (dateValue === 1) {
        catAxis.minPeriod = '10mm';
      } else if (dateValue === 2) {
        catAxis.minPeriod = 'hh';
      } else if (dateValue === 3) {
        catAxis.minPeriod = '3hh';
      } else {
        catAxis.minPeriod = '8hh';
      }

      var startDuration = 1;
      if (!data[0].balloon) {
        startDuration = 0;
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
      var cluster = _.replace(clusterSelected, /\s/g, '_');
      dateLabel = _.replace(dateLabel, /\s/g, '_');
      var ExportFileName = 'MediaService_Utilization_' + cluster + '_' + dateLabel + '_' + new Date();

      var chartData = CommonReportsGraphService.getBaseStackSerialGraph(data, startDuration, valueAxes, graphs, 'time', catAxis, CommonReportsGraphService.getBaseExportForGraph(exportFields, ExportFileName, columnNames));
      chartData.legend = CommonReportsGraphService.getBaseVariable(LEGEND);
      chartData.legend.labelText = '[[title]]';
      chartData.legend.useGraphSettings = true;
      var chart = AmCharts.makeChart(utilizationdiv, chartData);
      chart.addListener('rendered', zoomChart);
      zoomChart(chart);
      return chart;
    }

    function getClusterName(graphs, clusterMap, clusterSelected, clusterId) {
      var tempData = [];
      _.forEach(graphs, function (value) {
        var clusterName = _.findKey(clusterMap, function (val) {
          return val === value.valueField;
        });
        if (!_.isUndefined(clusterName)) {
          value.title = clusterName;
          if (allClusters !== clusterId && clusterSelected !== value.title) {
            value.lineAlpha = 0.2;
          }
          value.balloonText = '<span class="graph-text">' + value.title + ' ' + utilization + ' <span class="graph-number">[[value]]</span></span>';
          value.lineThickness = 2;
        }
        if (value.valueField === 'average_util') {
          value.title = average_utilzation;
          value.lineColor = '#4E5051';
          value.dashLength = 4;
          value.balloonText = '<span class="graph-text">' + value.title + ' <span class="graph-number">[[value]]</span></span>';
          value.lineThickness = 2;
        }
        if (value.title !== value.valueField) {
          value.connect = false;
          tempData.push(value);
        }
      });
      tempData = _.sortBy(tempData, 'title');
      return tempData;
    }

    function zoomChart(chart) {
      chart.zoomToIndexes(chart.dataProvider.length - 40, chart.dataProvider.length - 1);
    }
  }
})();
