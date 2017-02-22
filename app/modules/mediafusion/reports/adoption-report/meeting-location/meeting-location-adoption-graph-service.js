(function () {
  'use strict';

  angular.module('Mediafusion').service('MeetingLocationAdoptionGraphService', MeetingLocationAdoptionGraphService);
  /* @ngInject */
  function MeetingLocationAdoptionGraphService(CommonReportsGraphService, chartColors, $translate, $rootScope) {

    var vm = this;
    vm.meetingLocationdiv = 'meetingLocationdiv';
    vm.GUIDEAXIS = 'guideaxis';
    vm.AXIS = 'axis';
    vm.LEGEND = 'legend';
    vm.timeDiff = null;
    vm.dateSelected = null;
    vm.zoomedEndTime = null;
    vm.zoomedStartTime = null;

    vm.timeStamp = $translate.instant('mediaFusion.metrics.timeStamp');
    vm.meetingLocation = $translate.instant('mediaFusion.metrics.meetings');

    return {
      setMeetingLocationGraph: setMeetingLocationGraph,
    };

    function setMeetingLocationGraph(response, meetingLocationChart, daterange) {
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

        meetingLocationChart = createMeetingLocationGraph(data, graphs, daterange, isDummy);
        meetingLocationChart.dataProvider = data;
        meetingLocationChart.graphs = graphs;
        meetingLocationChart.startDuration = startDuration;
        meetingLocationChart.balloon.enabled = true;
        meetingLocationChart.chartCursor.valueLineBalloonEnabled = true;
        meetingLocationChart.chartCursor.valueLineEnabled = true;
        meetingLocationChart.chartCursor.categoryBalloonEnabled = true;
        meetingLocationChart.chartCursor.oneBalloonOnly = true;
        meetingLocationChart.chartCursor.balloonColor = chartColors.grayLightTwo;
        meetingLocationChart.chartCursor.valueBalloonsEnabled = true;
        if (isDummy) {
          meetingLocationChart.chartCursor.valueLineBalloonEnabled = false;
          meetingLocationChart.chartCursor.valueLineEnabled = false;
          meetingLocationChart.chartCursor.categoryBalloonEnabled = false;
          meetingLocationChart.balloon.enabled = false;
        }
        meetingLocationChart.validateData();
        return meetingLocationChart;
      }
    }

    function createMeetingLocationGraph(data, graphs, daterange, isDummy) {
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
      valueAxes[0].title = vm.meetingLocation;
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
        'time': vm.timeStamp,
      };
      var exportFields = [];
      _.forEach(graphs, function (value) {
        columnNames[value.valueField] = value.title + ' ' + vm.meetingLocation;
      });
      for (var key in columnNames) {
        exportFields.push(key);
      }
      dateLabel = _.replace(dateLabel, /\s/g, '_');
      var ExportFileName = 'MediaService_MeetingLocation_' + '_' + dateLabel + '_' + new Date();

      if (!isDummy) {
        graphs.push({
          'title': 'All',
          'id': 'all',
          'bullet': 'square',
          'bulletSize': 10,
          'lineColor': '#000000',
          'hidden': true,
        });

        graphs.push({
          'title': 'None',
          'id': 'none',
          'bullet': 'square',
          'bulletSize': 10,
          'lineColor': '#000000',
        });
      }

      var chartData = CommonReportsGraphService.getBaseStackSerialGraph(data, startDuration, valueAxes, graphs, 'time', catAxis, CommonReportsGraphService.getBaseExportForGraph(exportFields, ExportFileName, columnNames));
      chartData.legend = CommonReportsGraphService.getBaseVariable(vm.LEGEND);
      chartData.legend.labelText = '[[title]]';
      chartData.legend.useGraphSettings = true;

      chartData.legend.listeners = [{
        'event': 'hideItem',
        "method": legendHandler,
      }, {
        'event': 'showItem',
        'method': legendHandler,
      }];

      var chart = AmCharts.makeChart(vm.meetingLocationdiv, chartData);
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
        value.balloonText = '<span class="graph-text">' + value.title + ' ' + '<span class="graph-number">[[value]]</span></span>';
        value.lineThickness = 2;
        tempData.push(value);
      });
      tempData = _.sortBy(tempData, 'title');
      return tempData;
    }

    function legendHandler(evt) {
      if (evt.dataItem.id === 'all') {
        _.forEach(evt.chart.graphs, function (graph) {
          if (graph.id != 'all') {
            evt.chart.showGraph(graph);
          } else if (graph.id === 'all') {
            evt.chart.hideGraph(graph);
          }

        });
      } else if (evt.dataItem.id === 'none') {
        _.forEach(evt.chart.graphs, function (graph) {
          if (graph.id != 'all') {
            evt.chart.hideGraph(graph);
          } else if (graph.id === 'all') {
            evt.chart.showGraph(graph);
          }
        });
      }
    }

  }
})();
