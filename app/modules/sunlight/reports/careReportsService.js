(function () {
  'use strict';

  angular.module('Sunlight')
    .service('CareReportsService', CareReportsService);

  /* @ngInject */
  function CareReportsService($translate, CareReportsGraphService, chartColors) {

    function setTaskIncomingGraphs(data, categoryAxisTitle, selectedIndex) {

      var report = {};
      report.data = data;
      report.divId = 'taskIncomingdiv';
      report.categoryTitle = categoryAxisTitle;
      report.legendTitles = getLegendTitles(selectedIndex);
      report.valueFields = getValueFields(selectedIndex);
      report.colors = getColors(selectedIndex, false);
      if (selectedIndex == 0) {
        report.fillColors = [chartColors.colorLightGreenFill, chartColors.colorLightYellowFill, chartColors.stripeColor, chartColors.colorLightRedFill];
        report.showBalloon = [false, false, false, true];
        report.balloonText = '<span class="care-graph-text">' + $translate.instant('careReportsPage.abandoned') + ' [[value]]</span><br><span class="care-graph-text">' + $translate.instant('careReportsPage.in-queue') + ' [[numTasksQueuedState]]</span><br><span class="care-graph-text">' + $translate.instant('careReportsPage.assigned') + ' [[numTasksAssignedState]]</span><br><span class="care-graph-text">' + $translate.instant('careReportsPage.handled') + ' [[numTasksHandledState]]</span>';
      } else {
        report.fillColors = [chartColors.colorLightGreenFill, chartColors.colorLightRedFill];
        report.showBalloon = [false, true];
        report.balloonText = '<span class="care-graph-text">' + $translate.instant('careReportsPage.abandoned') + ' [[value]]</span><br><span class="care-graph-text">' + $translate.instant('careReportsPage.handled') + ' [[numTasksHandledState]]</span>';
      }
      report.enableExport = true;
      report.cursorAlpha = 1;
      report.fillAlphas = 0.1;
      createCareReportsGraph(report, selectedIndex, false);
    }

    function getLegendTitles(selectedIndex) {
      if (selectedIndex == 0) {
        return [$translate.instant('careReportsPage.handled'),
          $translate.instant('careReportsPage.assigned'), $translate.instant('careReportsPage.in-queue'), $translate.instant('careReportsPage.abandoned')
        ];
      } else {
        return [$translate.instant('careReportsPage.handled'), $translate.instant('careReportsPage.abandoned')];
      }

    }

    function getValueFields(selectedIndex) {
      if (selectedIndex == 0) {
        return ['numTasksHandledState', 'numTasksAssignedState', 'numTasksQueuedState', 'numTasksAbandonedState'];
      } else {
        return ['numTasksHandledState', 'numTasksAbandonedState'];
      }
    }

    function getColors(selectedIndex, isDummy) {
      if (isDummy) {
        if (selectedIndex == 0) {
          return [chartColors.grayLight, chartColors.grayLighter, chartColors.dummyGrayLight, chartColors.dummyGrayLighter];
        }
        return [chartColors.dummyGrayLight, chartColors.dummyGrayLighter];
      } else {
        if (selectedIndex == 0) {
          return [chartColors.colorLightGreen, chartColors.colorLightYellow, chartColors.colorLightYellow, chartColors.colorLightRed];
        }
        return [chartColors.colorLightGreen, chartColors.colorLightRed];
      }
    }

    function setTaskIncomingDummyData(data, categoryAxisTitle, selectedIndex) {
      var dummyReport = {};
      dummyReport.data = data;
      dummyReport.divId = 'taskIncomingdiv';
      dummyReport.categoryTitle = categoryAxisTitle;
      dummyReport.legendTitles = getLegendTitles(selectedIndex);
      dummyReport.valueFields = getValueFields(selectedIndex);
      dummyReport.colors = getColors(selectedIndex, true);
      dummyReport.fillColors = getColors(selectedIndex, true);
      dummyReport.enableExport = false;
      if (selectedIndex == 0) {
        dummyReport.showBalloon = [false, false, false, false];
      } else {
        dummyReport.showBalloon = [false, false];
      }
      dummyReport.cursorAlpha = 0;
      dummyReport.fillAlphas = 1;
      createCareReportsGraph(dummyReport, selectedIndex, true);
    }

    function createCareReportsGraph(report, selectedIndex, isDummy) {

      var valueAxes = [CareReportsGraphService.getBaseVariable('axis')];
      valueAxes[0].title = 'Tasks';
      valueAxes[0].stackType = 'regular';
      //valueAxes[0].position = 'left';

      var catAxis = CareReportsGraphService.getBaseVariable('axis');
      catAxis.startOnAxis = true;
      catAxis.title = report.categoryTitle;

      var exportReport = CareReportsGraphService.getBaseVariable('export');
      exportReport.enabled = report.enableExport;

      var chartCursor = CareReportsGraphService.getBaseVariable('chartCursor');
      chartCursor.cursorAlpha = report.cursorAlpha;

      var chartData = CareReportsGraphService.getBaseSerialGraph(report, valueAxes, getGraphs(report, isDummy), 'createdTime', catAxis, exportReport, chartCursor, selectedIndex);

      return AmCharts.makeChart(report.divId, chartData);
    }

    function getGraphs(report, isDummy) {
      var graphs = [];

      var pattern = {
        "url": "line_pattern.png",
        "width": 14,
        "height": 14
      };
      var dashLength = [0, 0, 2, 0];
      for (var i = 0; i < report.valueFields.length; i++) {
        graphs.push(CareReportsGraphService.getBaseVariable('graph'));
        graphs[i].title = report.legendTitles[i];
        graphs[i].lineColor = report.colors[i];
        graphs[i].fillColors = report.fillColors[i];
        graphs[i].valueField = report.valueFields[i];
        graphs[i].balloonText = report.balloonText;
        graphs[i].fillAlphas = report.fillAlphas;
        graphs[i].showBalloon = report.showBalloon[i];
        graphs[i].legendValueText = ' ';
        if (!isDummy) {
          graphs[i].dashLength = dashLength[i];
          if (i == 2) { // in-queue graph
            graphs[i].pattern = pattern;
            graphs[i].fillAlphas = 1;
          }
        }
        graphs[i].plotAreaBorderAlpha = 0;
        graphs[i].marginTop = 10;
        graphs[i].marginLeft = 0;
      }
      return graphs;
    }

    var service = {
      setTaskIncomingGraphs: setTaskIncomingGraphs,
      setTaskIncomingDummyData: setTaskIncomingDummyData
    };

    return service;
  }
})();
