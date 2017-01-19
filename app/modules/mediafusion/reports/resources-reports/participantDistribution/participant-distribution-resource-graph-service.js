(function () {
  'use strict';

  angular.module('Mediafusion').service('ParticipantDistributionResourceGraphService', ParticipantDistributionResourceGraphService);
  /* @ngInject */
  function ParticipantDistributionResourceGraphService(CommonReportsGraphService, chartColors, $translate, $log) {

    var vm = this;
    var participantDistributiondiv = 'participantDistributiondiv';
    vm.GUIDEAXIS = 'guideaxis';
    vm.AXIS = 'axis';
    vm.LEGEND = 'legend';

    vm.timeStamp = $translate.instant('mediaFusion.metrics.timeStamp');
    vm.allClusters = $translate.instant('mediaFusion.metrics.allclusters');

    return {
      setParticipantDistributionGraph: setParticipantDistributionGraph
    };

    function setParticipantDistributionGraph(response, participantDistributionChart, clusterSelected, clusterId, daterange, clusterMap) {
      var isDummy = false;
      var data = response.graphData;
      var graphs = getClusterName(response.graphs, clusterMap, clusterSelected, clusterId);
      if (data === null || data === 'undefined' || data.length === 0) {
        return;
      } else {
        if (data[0].colorTwo === chartColors.grayLightTwo) {
          isDummy = true;
        }
        var startDuration = 1;
        if (!data[0].balloon) {
          startDuration = 0;
        }

        participantDistributionChart = createParticipantDistributionGraph(data, graphs, clusterSelected, daterange);
        participantDistributionChart.dataProvider = data;
        participantDistributionChart.graphs = graphs;
        participantDistributionChart.startDuration = startDuration;
        participantDistributionChart.balloon.enabled = true;
        participantDistributionChart.chartCursor.valueLineBalloonEnabled = true;
        participantDistributionChart.chartCursor.valueLineEnabled = true;
        participantDistributionChart.chartCursor.categoryBalloonEnabled = true;
        participantDistributionChart.chartCursor.oneBalloonOnly = true;
        participantDistributionChart.chartCursor.balloonColor = chartColors.grayLightTwo;
        participantDistributionChart.chartCursor.valueBalloonsEnabled = true;
        if (isDummy) {
          participantDistributionChart.chartCursor.valueLineBalloonEnabled = false;
          participantDistributionChart.chartCursor.valueLineEnabled = false;
          participantDistributionChart.chartCursor.categoryBalloonEnabled = false;
          participantDistributionChart.balloon.enabled = false;
        }
        participantDistributionChart.validateData();
        return participantDistributionChart;
      }
    }

    function createParticipantDistributionGraph(data, graphs, clusterSelected, daterange) {
      if (data === null || data === 'undefined' || data.length === 0) {
        return;
      }
      var valueAxes = [CommonReportsGraphService.getBaseVariable(vm.GUIDEAXIS)];
      valueAxes[0].integersOnly = true;
      valueAxes[0].axisAlpha = 0.5;
      valueAxes[0].axisColor = '#1C1C1C';
      valueAxes[0].minimum = 0;
      valueAxes[0].autoGridCount = true;
      valueAxes[0].position = 'left';
      valueAxes[0].title = 'Participants';
      valueAxes[0].titleRotation = 0;

      var catAxis = CommonReportsGraphService.getBaseVariable(vm.AXIS);
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
        'time': vm.timeStamp
      };
      var exportFields = [];
      _.forEach(graphs, function (value) {
        columnNames[value.valueField] = value.title;
      });
      for (var key in columnNames) {
        exportFields.push(key);
      }
      var cluster = _.replace(clusterSelected, /\s/g, '_');
      dateLabel = _.replace(dateLabel, /\s/g, '_');
      var ExportFileName = 'MediaService_ParticipantDistribution_' + cluster + '_' + dateLabel + '_' + new Date();

      graphs.push({
        'title': 'All',
        'id': 'all'
      });

      var chartData = CommonReportsGraphService.getBaseStackSerialGraph(data, startDuration, valueAxes, graphs, 'time', catAxis, CommonReportsGraphService.getBaseExportForGraph(exportFields, ExportFileName, columnNames));
      chartData.legend = CommonReportsGraphService.getBaseVariable(vm.LEGEND);
      chartData.legend.labelText = '[[title]]';
      chartData.legend.useGraphSettings = true;

      chartData.legend.listeners = [{
        'event': 'hideItem',
        "method": legendHandler
      }, {
        'event': 'showItem',
        'method': legendHandler
      }];


      var chart = AmCharts.makeChart(participantDistributiondiv, chartData);
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
          if (vm.allClusters !== clusterId && clusterSelected !== value.title) {
            value.lineAlpha = 0.2;
          }
          value.balloonText = '<span class="graph-text">' + value.title + ' ' + ' <span class="graph-number">[[value]]</span></span>';
          value.lineThickness = 2;
        }
        if (value.title !== value.valueField) {
          value.connect = false;
          tempData.push(value);
        }
      });
      tempData = _.sortBy(tempData, 'title');
      $log.log(JSON.stringify(tempData));
      return tempData;
    }

    function zoomChart(chart) {
      chart.zoomToIndexes(chart.dataProvider.length - 40, chart.dataProvider.length - 1);
    }

    function legendHandler(evt) {
      var state = evt.dataItem.hidden;
      if (evt.dataItem.id === 'all') {
        _.forEach(evt.chart.graphs, function (graph) {
          if (graph.id != 'all') {
            evt.chart[state ? 'hideGraph' : 'showGraph'](graph);
          }
        });
      }
    }
  }
})();
