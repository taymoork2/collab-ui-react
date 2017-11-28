(function () {
  'use strict';

  angular.module('Mediafusion').service('NumberOfParticipantGraphService', NumberOfParticipantGraphService);

  var ChartColors = require('modules/core/config/chartColors').ChartColors;

  /* @ngInject */
  function NumberOfParticipantGraphService(CommonReportsGraphService, $translate, $rootScope) {
    var numberOfParticipantdiv = 'numberOfParticipantdiv';
    var exportDiv = 'number-of-participant-div';
    var GUIDEAXIS = 'guideaxis';
    var AXIS = 'axis';
    var LEGEND = 'legend';

    var timeStamp = $translate.instant('mediaFusion.metrics.timeStamp');
    var participantsTitle = $translate.instant('mediaFusion.metrics.participants');
    var onPremisesHeading = $translate.instant('mediaFusion.metrics.onPremisesHeading');
    var cloudHeading = $translate.instant('mediaFusion.metrics.cloudHeading');

    var zoomedEndTime = null;
    var zoomedStartTime = null;

    var timeDiff = null;
    var dateSelected = null;

    return {
      setNumberOfParticipantGraph: setNumberOfParticipantGraph,
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
        numberOfParticipantChart.balloon.horizontalPadding = 3;
        numberOfParticipantChart.balloon.verticalPadding = 2;
        numberOfParticipantChart.chartCursor.valueLineBalloonEnabled = true;
        numberOfParticipantChart.chartCursor.valueLineEnabled = true;
        numberOfParticipantChart.chartCursor.categoryBalloonEnabled = true;
        numberOfParticipantChart.chartCursor.oneBalloonOnly = true;
        numberOfParticipantChart.chartCursor.balloonColor = ChartColors.grayLightTwo;
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
      valueAxes[0].title = participantsTitle;
      //valueAxes[0].titleRotation = 0;
      valueAxes[0].labelOffset = 28;

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
        time: timeStamp,
      };
      _.each(graphs, function (value) {
        if (value.title === 'onPremParticipants') {
          value.title = onPremisesHeading;
          value.lineColor = '#67b7dc';
          columnNames[value.valueField] = value.title;
        } else if (value.title === 'cloudParticipants') {
          value.title = cloudHeading;
          value.lineColor = '#f0a378';
          columnNames[value.valueField] = value.title;
        }
      });
      var exportFields = [];
      _.each(columnNames, function (key) {
        exportFields.push(key);
      });
      dateLabel = _.replace(dateLabel, /\s/g, '_');
      var ExportFileName = 'MediaService_Number_of_Participants' + dateLabel + '_' + new Date();
      var chartData = CommonReportsGraphService.getBaseStackSerialGraph(data, startDuration, valueAxes, graphs, 'time', catAxis, CommonReportsGraphService.getBaseExportForGraph(exportFields, ExportFileName, columnNames, exportDiv));
      chartData.chartCursor.balloonPointerOrientation = 'vertical';
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
        endTime: zoomedEndTime,
      };
      if ((_.isUndefined(dateSelected.value) && zoomedStartTime !== dateSelected.startTime && zoomedEndTime !== dateSelected.endTime) || (zoomedStartTime !== dateSelected.startTime && zoomedEndTime !== dateSelected.endTime)) {
        $rootScope.$broadcast('zoomedTime', {
          data: selectedTime,
        });
      }
    }

    function formatGraph(graphs) {
      var callsBallon = $translate.instant('mediaFusion.metrics.callsBallon');
      var tempData = [];
      _.each(graphs, function (value) {
        if (value.title === 'cloudParticipants') {
          value.balloonText = '<div class="insight-balloon-div"><span class="graph-text dis-inline-block">' + cloudHeading + ' ' + callsBallon + ' ' + ' <span class="graph-number dis-inline-block">[[value]]</span></span>' + ' <p class="graph-text insight-padding"><span class="graph-text-color dis-inline-block">[[' + value.descriptionField + ']]</span></p></div>';
        } else if (value.title === 'onPremParticipants') {
          value.balloonText = '<div class="insight-balloon-div"><span class="graph-text dis-inline-block">' + onPremisesHeading + ' ' + callsBallon + ' ' + ' <span class="graph-number dis-inline-block">[[value]]</span></span>' + ' <span class="graph-text"><span class="graph-text-color dis-inline-block">[[' + value.descriptionField + ']]</span></span></div>';
        }
        value.lineThickness = 2;
        value.connect = false;
        tempData.push(value);
      });
      return tempData;
    }
  }
})();
