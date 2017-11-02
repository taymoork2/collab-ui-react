(function () {
  'use strict';

  angular.module('Mediafusion').service('MeetingLocationAdoptionGraphService', MeetingLocationAdoptionGraphService);

  var ChartColors = require('modules/core/config/chartColors').ChartColors;

  /* @ngInject */
  function MeetingLocationAdoptionGraphService(CommonReportsGraphService, $translate, $rootScope) {
    var vm = this;
    vm.meetingLocationdiv = 'meetingLocationdiv';
    vm.exportDiv = 'meeting-location-div';
    vm.GUIDEAXIS = 'guideaxis';
    vm.AXIS = 'axis';
    vm.LEGEND = 'legend';
    vm.timeDiff = null;
    vm.dateSelected = null;
    vm.zoomedEndTime = null;
    vm.zoomedStartTime = null;

    vm.timeStamp = $translate.instant('mediaFusion.metrics.timeStamp');
    vm.meetingLocation = $translate.instant('mediaFusion.metrics.meetings');
    vm.onPremisesHeading = $translate.instant('mediaFusion.metrics.onPremisesHeading');
    vm.cloudHeading = $translate.instant('mediaFusion.metrics.cloudHeading');
    vm.hybridHeading = $translate.instant('mediaFusion.metrics.hybridHeading');
    vm.totalHeading = $translate.instant('mediaFusion.metrics.clientType.total');
    vm.locations = $translate.instant('mediaFusion.metrics.location');
    vm.allOn = $translate.instant('mediaFusion.metrics.allOn');
    vm.allOff = $translate.instant('mediaFusion.metrics.allOff');

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
        meetingLocationChart.chartCursor.balloonColor = ChartColors.grayLightTwo;
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
      _.each(graphs, function (value) {
        if (value.valueField === 'ON_PREM') {
          value.lineColor = '#02bbcc';
          value.title = vm.onPremisesHeading;
        } else if (value.valueField === 'CLOUD') {
          value.lineColor = '#30d557';
          value.title = vm.cloudHeading;
        } else if (value.valueField === 'HYBRID') {
          value.lineColor = '#ff7133';
          value.title = vm.hybridHeading;
        }
        columnNames[value.valueField] = value.title + ' ' + vm.meetingLocation;
      });
      _.each(columnNames, function (key) {
        exportFields.push(key);
      });
      dateLabel = _.replace(dateLabel, /\s/g, '_');
      var ExportFileName = 'MediaService_MeetingLocation_' + '_' + dateLabel + '_' + new Date();

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

      var chart = AmCharts.makeChart(vm.meetingLocationdiv, chartData);
      // listen for zoomed event and call 'handleZoom' method
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
      _.each(graphs, function (value) {
        value.lineThickness = 2;
        if (value.title === 'ON_PREM') {
          value.balloonText = '<span class="graph-text">' + vm.onPremisesHeading + ' ' + '<span class="graph-number">[[value]]</span></span>';
          tempData[1] = value;
        } else if (value.title === 'CLOUD') {
          value.balloonText = '<span class="graph-text">' + vm.cloudHeading + ' ' + '<span class="graph-number">[[value]]</span></span>';
          tempData[0] = value;
        } else if (value.title === 'HYBRID') {
          value.balloonText = '<span class="graph-text">' + vm.hybridHeading + ' ' + '<span class="graph-number">[[value]]</span></span>';
          tempData[2] = value;
        } else if (value.title === 'Location' && value.isDummy) {
          value.balloonText = '<span class="graph-text">' + vm.locations + ' ' + '<span class="graph-number">[[value]]</span></span>';
          tempData[0] = value;
        } else {
          value.balloonText = '<span class="graph-text">' + vm.totalHeading + ' ' + '<span class="graph-number">[[value]]</span></span>';
          tempData[3] = value;
        }
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
