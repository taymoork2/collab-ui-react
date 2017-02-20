(function () {
  'use strict';

  angular.module('Mediafusion').service('NumberOfParticipantGraphService', NumberOfParticipantGraphService);
  /* @ngInject */
  function NumberOfParticipantGraphService(CommonReportsGraphService, chartColors, $translate, $rootScope) {

    var numberOfParticipantdiv = 'numberOfParticipantdiv';
    var GUIDEAXIS = 'guideaxis';
    var AXIS = 'axis';
    var LEGEND = 'legend';

    var timeStamp = $translate.instant('mediaFusion.metrics.timeStamp');
    var numberOfParticipantTitle = $translate.instant('mediaFusion.metrics.numberOfParticipantTitle');

    var zoomedEndTime = null;
    var zoomedStartTime = null;

    var timeDiff = null;
    var dateSelected = null;

    return {
      setNumberOfParticipantGraph: setNumberOfParticipantGraph
    };

    function setNumberOfParticipantGraph(response, numberOfParticipantChart, daterange) {
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

        numberOfParticipantChart = createNumberOfParticipantGraph(data, graphs, daterange);
        numberOfParticipantChart.dataProvider = data;
        numberOfParticipantChart.graphs = graphs;
        numberOfParticipantChart.startDuration = startDuration;
        numberOfParticipantChart.balloon.enabled = true;
        numberOfParticipantChart.chartCursor.valueLineBalloonEnabled = true;
        numberOfParticipantChart.chartCursor.valueLineEnabled = true;
        numberOfParticipantChart.chartCursor.categoryBalloonEnabled = true;
        numberOfParticipantChart.chartCursor.oneBalloonOnly = true;
        numberOfParticipantChart.chartCursor.balloonColor = chartColors.grayLightTwo;
        numberOfParticipantChart.chartCursor.valueBalloonsEnabled = true;
        if (isDummy) {
          numberOfParticipantChart.chartCursor.valueLineBalloonEnabled = false;
          numberOfParticipantChart.chartCursor.valueLineEnabled = false;
          numberOfParticipantChart.chartCursor.categoryBalloonEnabled = false;
          numberOfParticipantChart.balloon.enabled = false;
        }
        numberOfParticipantChart.validateData();
        return numberOfParticipantChart;
      }
    }

    function createNumberOfParticipantGraph(data, graphs, daterange) {
      if (data === null || data === 'undefined' || data.length === 0) {
        return;
      }
      var valueAxes = [CommonReportsGraphService.getBaseVariable(GUIDEAXIS)];
      dateSelected = daterange;
      valueAxes[0].integersOnly = true;
      valueAxes[0].axisAlpha = 0.5;
      valueAxes[0].axisColor = '#1C1C1C';
      valueAxes[0].minimum = 0;
      valueAxes[0].autoGridCount = true;
      valueAxes[0].position = 'left';
      valueAxes[0].title = numberOfParticipantTitle;
      valueAxes[0].titleRotation = 270;

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

      if (_.isUndefined(daterange.value)) {
        timeDiff = Math.floor(moment(dateSelected.endTime).diff(moment(dateSelected.startTime)) / 60000);
        if (timeDiff <= 240) {
          catAxis.minPeriod = '1mm';
        } else if (timeDiff > 240 && timeDiff <= 1440) {
          catAxis.minPeriod = '10mm';
        } else if (timeDiff > 1440 && timeDiff <= 10080) {
          catAxis.minPeriod = 'hh';
        } else if (timeDiff > 10080 && timeDiff <= 43200) {
          catAxis.minPeriod = '3hh';
        } else if (timeDiff > 43200) {
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
        'time': timeStamp
      };
      var exportFields = [];
      _.forEach(graphs, function (value) {
        if (value.title !== 'cloud') {
          columnNames[value.valueField] = value.title + ' ' + 'on-premises';
        } else {
          columnNames[value.valueField] = value.title + ' ' + 'cloud';
        }
      });
      for (var key in columnNames) {
        exportFields.push(key);
      }
      dateLabel = _.replace(dateLabel, /\s/g, '_');
      var ExportFileName = 'MediaService_Number_of_Participants' + dateLabel + '_' + new Date();
      var chartData = CommonReportsGraphService.getBaseStackSerialGraph(data, startDuration, valueAxes, graphs, 'time', catAxis, CommonReportsGraphService.getBaseExportForGraph(exportFields, ExportFileName, columnNames));
      chartData.legend = CommonReportsGraphService.getBaseVariable(LEGEND);
      chartData.legend.labelText = '[[title]]';
      chartData.legend.useGraphSettings = true;

      var chart = AmCharts.makeChart(numberOfParticipantdiv, chartData);
      chart.addListener('zoomed', handleZoom);
      return chart;
    }

    // this method is called each time the selected period of the chart is changed
    function handleZoom(event) {
      zoomedStartTime = event.startDate;
      zoomedEndTime = event.endDate;
      var selectedTime = {
        startTime: zoomedStartTime,
        endTime: zoomedEndTime
      };
      if ((_.isUndefined(dateSelected.value) && zoomedStartTime !== dateSelected.startTime && zoomedEndTime !== dateSelected.endTime) || (zoomedStartTime !== dateSelected.startTime && zoomedEndTime !== dateSelected.endTime)) {
        $rootScope.$broadcast('zoomedTime', {
          data: selectedTime
        });
      }
    }

    function formatGraph(graphs) {
      var tempData = [];
      _.forEach(graphs, function (value) {
        value.balloonText = '<span class="graph-text">' + value.title + ' <span class="graph-number">[[value]]</span></span>';
        value.lineThickness = 2;
        value.connect = true;
        tempData.push(value);
      });
      return tempData;
    }
  }
})();
