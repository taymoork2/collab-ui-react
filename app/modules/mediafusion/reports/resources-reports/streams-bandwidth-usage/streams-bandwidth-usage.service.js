(function () {
  'use strict';

  angular.module('Mediafusion').service('StreamsBandwidthUsageGraphService', StreamsBandwidthUsageGraphService);

  var ChartColors = require('modules/core/config/chartColors').ChartColors;

  /* @ngInject */
  function StreamsBandwidthUsageGraphService($rootScope, $translate, CommonReportsGraphService) {
    var vm = this;
    vm.cascadeBandwidthDiv = 'streamsBandwidthUsageDiv';
    vm.exportDiv = 'streamsBandwidthUsageExportDiv';
    vm.GUIDEAXIS = 'guideaxis';
    vm.AXIS = 'axis';
    vm.LEGEND = 'legend';

    vm.timeStamp = $translate.instant('mediaFusion.metrics.timeStamp');
    vm.allClusters = $translate.instant('mediaFusion.metrics.allclusters');
    vm.megabytes = $translate.instant('mediaFusion.clusterBandwidth.megabytes');
    vm.allOn = $translate.instant('mediaFusion.metrics.allOn');
    vm.allOff = $translate.instant('mediaFusion.metrics.allOff');
    vm.streamsTypeMap = {
      audioMegabytes: $translate.instant('mediaFusion.metrics.streamsBandwidthType.audio'),
      videoMegabytes: $translate.instant('mediaFusion.metrics.streamsBandwidthType.video'),
      presMegabytes: $translate.instant('mediaFusion.metrics.streamsBandwidthType.presentation'),
    };

    vm.zoomedEndTime = null;
    vm.zoomedStartTime = null;

    vm.timeDiff = null;
    vm.dateSelected = null;

    return {
      setStreamsBandwidthGraph: setStreamsBandwidthGraph,
    };

    function setStreamsBandwidthGraph(response, streamsBandwidthChart, clusterSelected, clusterId, daterange) {
      var isDummy = false;
      var data = response.graphData;
      var graphs = formatGraph(response.graphs);
      if (data === null || data === 'undefined' || data.length === 0) {
        return undefined;
      } else {
        if (graphs[0].isDummy) {
          isDummy = true;
        }
        var startDuration = 1;
        if (!data[0].balloon) {
          startDuration = 0;
        }

        streamsBandwidthChart = createStreamsBandwidthGraph(data, graphs, clusterSelected, daterange, isDummy);
        streamsBandwidthChart.dataProvider = data;
        streamsBandwidthChart.graphs = graphs;
        streamsBandwidthChart.startDuration = startDuration;
        streamsBandwidthChart.balloon.enabled = true;
        streamsBandwidthChart.chartCursor.valueLineBalloonEnabled = true;
        streamsBandwidthChart.chartCursor.valueLineEnabled = true;
        streamsBandwidthChart.chartCursor.categoryBalloonEnabled = true;
        streamsBandwidthChart.chartCursor.oneBalloonOnly = true;
        streamsBandwidthChart.chartCursor.balloonColor = ChartColors.grayLightTwo;
        streamsBandwidthChart.chartCursor.valueBalloonsEnabled = true;
        if (isDummy) {
          streamsBandwidthChart.chartCursor.valueLineBalloonEnabled = false;
          streamsBandwidthChart.chartCursor.valueLineEnabled = false;
          streamsBandwidthChart.chartCursor.categoryBalloonEnabled = false;
          streamsBandwidthChart.balloon.enabled = false;
        }
        streamsBandwidthChart.validateData();
        return streamsBandwidthChart;
      }
    }

    function createStreamsBandwidthGraph(data, graphs, clusterSelected, daterange, isDummy) {
      if (data === null || data === 'undefined' || data.length === 0) {
        return;
      }
      var valueAxes = [CommonReportsGraphService.getBaseVariable(vm.GUIDEAXIS)];
      vm.dateSelected = daterange;
      valueAxes[0].integersOnly = true;
      valueAxes[0].axisAlpha = 0.5;
      valueAxes[0].axisColor = '#1C1C1C';
      valueAxes[0].minimum = 0;
      valueAxes[0].autoGridCount = true;
      valueAxes[0].position = 'left';
      valueAxes[0].title = vm.megabytes;
      valueAxes[0].labelOffset = 28;

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

      if (_.isUndefined(daterange.value)) {
        vm.timeDiff = Math.floor(moment(vm.dateSelected.endTime).diff(moment(vm.dateSelected.startTime)) / 60000);
        if (vm.timeDiff <= 240) {
          catAxis.minPeriod = '10mm';
        } else if (vm.timeDiff > 240 && vm.timeDiff <= 1440) {
          catAxis.minPeriod = '10mm';
        } else if (vm.timeDiff > 1440 && vm.timeDiff <= 10080) {
          catAxis.minPeriod = 'hh';
        } else if (vm.timeDiff > 10080 && vm.timeDiff <= 43200) {
          catAxis.minPeriod = '3hh';
        } else if (vm.timeDiff > 43200) {
          catAxis.minPeriod = '8hh';
        }
      } else {
        if (dateValue === 0) {
          catAxis.minPeriod = '10mm';
        } else if (dateValue === 1) {
          catAxis.minPeriod = '10mm';
        } else if (dateValue === 2) {
          catAxis.minPeriod = 'hh';
        } else if (dateValue === 3) {
          catAxis.minPeriod = '3hh';
        } else if (dateValue === 4) {
          catAxis.minPeriod = '8hh';
        }
      }

      var startDuration = 1;
      if (!data[0].balloon) {
        startDuration = 0;
      }

      var columnNames = {
        time: vm.timeStamp,
      };
      var exportFields = [];
      _.forEach(graphs, function (value) {
        if (!_.isUndefined(vm.streamsTypeMap[value.title])) {
          value.title = vm.streamsTypeMap[value.title];
        }
        columnNames[value.valueField] = value.title;
      });
      for (var key in columnNames) {
        exportFields.push(key);
      }
      var cluster = _.replace(clusterSelected, /\s/g, '_');
      dateLabel = _.replace(dateLabel, /\s/g, '_');
      var ExportFileName = 'MediaService_StreamsBandwidth_' + cluster + '_' + dateLabel + '_' + new Date();
      if (!isDummy) {
        graphs.push({
          title: vm.allOff,
          id: 'none',
          lineColor: 'transparent',
        });
      }
      var chartData = CommonReportsGraphService.getBaseStackSerialGraph(data, startDuration, valueAxes, graphs, 'time', catAxis, CommonReportsGraphService.getBaseExportForGraph(exportFields, ExportFileName, columnNames, vm.exportDiv));
      chartData.legend = CommonReportsGraphService.getBaseVariable(vm.LEGEND);
      if (chartData.graphs[0].lineColor === ChartColors.grayLightTwo) {
        chartData.legend.color = ChartColors.grayDarkThree;
      }
      chartData.legend.labelText = '[[title]]';
      chartData.legend.useGraphSettings = true;

      chartData.legend.listeners = [{
        event: 'hideItem',
        method: legendHandler,
      }, {
        event: 'showItem',
        method: legendHandler,
      }];


      var chart = AmCharts.makeChart(vm.cascadeBandwidthDiv, chartData);
      chart.addListener('zoomed', handleZoom);
      return chart;
    }

    function handleZoom(event) {
      vm.zoomedStartTime = event.startDate;
      vm.zoomedEndTime = event.endDate;
      var selectedTime = {
        startTime: vm.zoomedStartTime,
        endTime: vm.zoomedEndTime,
      };
      if ((_.isUndefined(vm.dateSelected.value) && vm.zoomedStartTime !== vm.dateSelected.startTime && vm.zoomedEndTime !== vm.dateSelected.endTime) || (vm.zoomedStartTime !== vm.dateSelected.startTime && vm.zoomedEndTime !== vm.dateSelected.endTime)) {
        $rootScope.$broadcast('zoomedTime', {
          data: selectedTime,
        });
      }
    }

    function formatGraph(graphs) {
      var tempData = [];
      _.each(graphs, function (value) {
        value.balloonText = '<span class="graph-text">' + vm.streamsTypeMap[value.title] + ' ' + '<span class="graph-number">[[value]]</span></span>';
        value.lineThickness = 2;
        value.connect = false;
        tempData.push(value);
      });
      return tempData;
    }

    function legendHandler(evt) {
      if (evt.dataItem.title === vm.allOff) {
        evt.dataItem.title = vm.allOn;
        _.each(evt.chart.graphs, function (graph) {
          if (graph.title != vm.allOn) {
            evt.chart.hideGraph(graph);
          } else {
            evt.chart.showGraph(graph);
          }
        });
      } else if (evt.dataItem.title === vm.allOn) {
        evt.dataItem.title = vm.allOff;
        _.each(evt.chart.graphs, function (graph) {
          evt.chart.showGraph(graph);
        });
      }
    }
  }
})();
