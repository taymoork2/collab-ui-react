(function () {
  'use strict';

  angular.module('Mediafusion').service('ClientTypeAdoptionGraphService', ClientTypeAdoptionGraphService);

  var ChartColors = require('modules/core/config/chartColors').ChartColors;

  /* @ngInject */
  function ClientTypeAdoptionGraphService(CommonReportsGraphService, $translate, $rootScope) {
    var vm = this;
    vm.clientTypediv = 'clientTypediv';
    vm.exportDiv = 'client-type-div';
    vm.GUIDEAXIS = 'guideaxis';
    vm.AXIS = 'axis';
    vm.LEGEND = 'legend';
    vm.timeDiff = null;
    vm.dateSelected = null;
    vm.zoomedEndTime = null;
    vm.zoomedStartTime = null;

    vm.timeStamp = $translate.instant('mediaFusion.metrics.timeStamp');
    vm.clients = $translate.instant('mediaFusion.metrics.clients');
    vm.clientTypeTranMap = {
      ANDROID: $translate.instant('mediaFusion.metrics.clientType.android'),
      BLACKBERRY: $translate.instant('mediaFusion.metrics.clientType.blackberry'),
      DESKTOP: $translate.instant('mediaFusion.metrics.clientType.desktop'),
      IPAD: $translate.instant('mediaFusion.metrics.clientType.ipad'),
      IPHONE: $translate.instant('mediaFusion.metrics.clientType.iphone'),
      JABBER: $translate.instant('mediaFusion.metrics.clientType.jabber'),
      SIP: $translate.instant('mediaFusion.metrics.clientType.sip'),
      SPARK_BOARD: $translate.instant('mediaFusion.metrics.clientType.board'),
      TEST: $translate.instant('mediaFusion.metrics.clientType.test'),
      TP_ENDPOINT: $translate.instant('mediaFusion.metrics.clientType.tp'),
      UC: $translate.instant('mediaFusion.metrics.clientType.uc'),
      UNKNOWN: $translate.instant('mediaFusion.metrics.clientType.unknown'),
      WINDOWS_MOBILE: $translate.instant('mediaFusion.metrics.clientType.windows'),
      Total: $translate.instant('mediaFusion.metrics.clientType.total'),
      MAC: $translate.instant('mediaFusion.metrics.clientType.mac'),
      WINDOWS: $translate.instant('mediaFusion.metrics.clientType.windowsDesk'),
    };
    vm.allOn = $translate.instant('mediaFusion.metrics.allOn');
    vm.allOff = $translate.instant('mediaFusion.metrics.allOff');

    return {
      setClientTypeGraph: setClientTypeGraph,
    };

    function setClientTypeGraph(response, clientTypeChart, daterange) {
      var isDummy = false;
      var data = response.graphData;
      var graphs = getClusterName(response.graphs);
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

        clientTypeChart = createClientTypeGraph(data, graphs, daterange, isDummy);
        clientTypeChart.dataProvider = data;
        clientTypeChart.graphs = graphs;
        clientTypeChart.startDuration = startDuration;
        clientTypeChart.balloon.enabled = true;
        clientTypeChart.chartCursor.valueLineBalloonEnabled = true;
        clientTypeChart.chartCursor.valueLineEnabled = true;
        clientTypeChart.chartCursor.categoryBalloonEnabled = true;
        clientTypeChart.chartCursor.oneBalloonOnly = true;
        clientTypeChart.chartCursor.balloonColor = ChartColors.grayLightTwo;
        clientTypeChart.chartCursor.valueBalloonsEnabled = true;
        if (isDummy) {
          clientTypeChart.chartCursor.valueLineBalloonEnabled = false;
          clientTypeChart.chartCursor.valueLineEnabled = false;
          clientTypeChart.chartCursor.categoryBalloonEnabled = false;
          clientTypeChart.balloon.enabled = false;
        }
        clientTypeChart.validateData();
        return clientTypeChart;
      }
    }

    function createClientTypeGraph(data, graphs, daterange, isDummy) {
      if (data === null || data === 'undefined' || data.length === 0) {
        return;
      }
      vm.dateSelected = daterange;
      var valueAxes = [CommonReportsGraphService.getBaseVariable(vm.GUIDEAXIS)];
      valueAxes[0].integersOnly = true;
      valueAxes[0].axisAlpha = 0.5;
      valueAxes[0].axisColor = '#1C1C1C';
      valueAxes[0].minimum = 0;
      valueAxes[0].autoGridCount = true;
      valueAxes[0].position = 'left';
      //Change to i10n
      valueAxes[0].title = vm.clients;
      //valueAxes[0].titleRotation = 0;
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

      if (_.isUndefined(dateValue)) {
        vm.timeDiff = Math.floor(moment(vm.dateSelected.endTime).diff(moment(vm.dateSelected.startTime)) / 60000);
        if (vm.timeDiff <= 240) {
          catAxis.minPeriod = '1mm';
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
          catAxis.minPeriod = '1mm';
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
        if (!_.isUndefined(vm.clientTypeTranMap[value.name])) {
          value.name = vm.clientTypeTranMap[value.name];
        }
        columnNames[value.valueField] = value.title + ' ' + vm.clientType;
      });
      for (var key in columnNames) {
        exportFields.push(key);
      }
      dateLabel = _.replace(dateLabel, /\s/g, '_');
      var ExportFileName = 'MediaService_ClientType_' + '_' + dateLabel + '_' + new Date();

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

      var chart = AmCharts.makeChart(vm.clientTypediv, chartData);
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
        endTime: vm.zoomedEndTime,
      };

      if ((_.isUndefined(vm.dateSelected.value) && vm.zoomedStartTime !== vm.dateSelected.startTime && vm.zoomedEndTime !== vm.dateSelected.endTime) || (vm.zoomedStartTime !== vm.dateSelected.startTime && vm.zoomedEndTime !== vm.dateSelected.endTime)) {
        $rootScope.$broadcast('zoomedTime', {
          data: selectedTime,
        });
      }
    }

    function getClusterName(graphs) {
      var tempData = [];
      _.forEach(graphs, function (value) {
        value.balloonText = '<span class="graph-text">' + vm.clientTypeTranMap[value.title] + ' ' + '<span class="graph-number">[[value]]</span></span>';
        value.lineThickness = 2;
        tempData.push(value);
      });
      tempData = _.sortBy(tempData, 'title');
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
