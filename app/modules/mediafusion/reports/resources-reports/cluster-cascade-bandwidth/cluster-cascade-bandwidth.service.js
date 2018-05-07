(function () {
  'use strict';

  angular.module('Mediafusion').service('ClusterCascadeBandwidthGraphService', ClusterCascadeBandwidthGraphService);

  var ChartColors = require('modules/core/config/chartColors').ChartColors;

  /* @ngInject */
  function ClusterCascadeBandwidthGraphService($rootScope, $translate, CommonReportsGraphService) {
    var vm = this;
    vm.cascadeBandwidthDiv = 'clusterCascadeBandwidthDiv';
    vm.exportDiv = 'clusterCascadeBandwidthExportDiv';
    vm.GUIDEAXIS = 'guideaxis';
    vm.AXIS = 'axis';
    vm.LEGEND = 'legend';

    vm.timeStamp = $translate.instant('mediaFusion.metrics.timeStamp');
    vm.allClusters = $translate.instant('mediaFusion.metrics.allclusters');
    vm.megabytes = $translate.instant('mediaFusion.clusterBandwidth.megabytes');
    vm.allOn = $translate.instant('mediaFusion.metrics.allOn');
    vm.allOff = $translate.instant('mediaFusion.metrics.allOff');
    vm.cascadeTypeMap = {
      rxMegabytes: $translate.instant('mediaFusion.metrics.streamsRx'),
      txMegabytes: $translate.instant('mediaFusion.metrics.streamsTx'),
    };

    vm.zoomedEndTime = null;
    vm.zoomedStartTime = null;

    vm.timeDiff = null;
    vm.dateSelected = null;

    return {
      setClusterCascadeBandwidthGraph: setClusterCascadeBandwidthGraph,
    };

    function setClusterCascadeBandwidthGraph(response, clusterCascadeBandwidthChart, clusterSelected, clusterId, daterange) {
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

        clusterCascadeBandwidthChart = createClusterCascadeBandwidthGraph(data, graphs, clusterSelected, daterange, isDummy);
        clusterCascadeBandwidthChart.dataProvider = data;
        clusterCascadeBandwidthChart.graphs = graphs;
        clusterCascadeBandwidthChart.startDuration = startDuration;
        clusterCascadeBandwidthChart.balloon.enabled = true;
        clusterCascadeBandwidthChart.chartCursor.valueLineBalloonEnabled = true;
        clusterCascadeBandwidthChart.chartCursor.valueLineEnabled = true;
        clusterCascadeBandwidthChart.chartCursor.categoryBalloonEnabled = true;
        clusterCascadeBandwidthChart.chartCursor.oneBalloonOnly = true;
        clusterCascadeBandwidthChart.chartCursor.balloonColor = ChartColors.grayLightTwo;
        clusterCascadeBandwidthChart.chartCursor.valueBalloonsEnabled = true;
        if (isDummy) {
          clusterCascadeBandwidthChart.chartCursor.valueLineBalloonEnabled = false;
          clusterCascadeBandwidthChart.chartCursor.valueLineEnabled = false;
          clusterCascadeBandwidthChart.chartCursor.categoryBalloonEnabled = false;
          clusterCascadeBandwidthChart.balloon.enabled = false;
        }
        clusterCascadeBandwidthChart.validateData();
        return clusterCascadeBandwidthChart;
      }
    }

    function createClusterCascadeBandwidthGraph(data, graphs, clusterSelected, daterange, isDummy) {
      if (data === null || data === 'undefined' || data.length === 0) {
        return;
      }
      var valueAxes = [CommonReportsGraphService.getBaseVariable(vm.GUIDEAXIS)];
      vm.dateSelected = daterange;
      valueAxes[0].integersOnly = false;
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
        if (!_.isUndefined(vm.cascadeTypeMap[value.title])) {
          value.title = vm.cascadeTypeMap[value.title];
        }
        columnNames[value.valueField] = value.title;
      });
      for (var key in columnNames) {
        exportFields.push(key);
      }
      var cluster = _.replace(clusterSelected, /\s/g, '_');
      dateLabel = _.replace(dateLabel, /\s/g, '_');
      var ExportFileName = 'MediaService_CascadeBandwidth_' + cluster + '_' + dateLabel + '_' + new Date();
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
        value.balloonText = '<span class="graph-text">' + vm.cascadeTypeMap[value.title] + ' ' + '<span class="graph-number">[[value]]</span></span>';
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
