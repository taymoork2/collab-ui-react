(function () {
  'use strict';

  angular.module('Sunlight')
    .service('CareReportsService', CareReportsService);

  /* @ngInject */
  function CareReportsService($translate, CareReportsGraphService, chartColors) {

    function setTaskIncomingGraphs(data, categoryAxisTitle) {
      var report = {};
      report.data = data;
      report.divId = 'taskIncomingdiv';
      report.categoryTitle = categoryAxisTitle;
      report.legendTitles = [$translate.instant('careReportsPage.handled'), $translate.instant('careReportsPage.abandoned')];
      report.valueFields = ['numTasksHandledState', 'numTasksAbandonedState'];
      report.colors = [chartColors.colorLightGreen, chartColors.colorLightRed];
      report.fillColors = [chartColors.colorLightGreen1, chartColors.colorLightRed1];
      report.enableExport = true;
      report.showBalloon = [false, true];
      report.cursorAlpha = 1;
      report.fillAlphas = 0.1;
      report.balloonText = '<span class="graph-text">Abandoned [[value]]</span><br><span class="graph-text">Handled [[numTasksHandledState]]</span>';

      createCareReportsGraph(report);
    }

    function setTaskIncomingDummyData(data, categoryAxisTitle) {
      var dummyReport = {};
      dummyReport.data = data;
      dummyReport.divId = 'taskIncomingdiv';
      dummyReport.categoryTitle = categoryAxisTitle;
      dummyReport.legendTitles = [$translate.instant('careReportsPage.handled'), $translate.instant('careReportsPage.abandoned')];
      dummyReport.valueFields = ['numTasksHandledState', 'numTasksAbandonedState'];
      dummyReport.colors = [chartColors.dummyGray, chartColors.dummyGrayLight];
      dummyReport.fillColors = [chartColors.dummyGray, chartColors.dummyGrayLight];
      dummyReport.enableExport = false;
      dummyReport.showBalloon = [false, false];
      dummyReport.cursorAlpha = 0;
      dummyReport.fillAlphas = 1;

      createCareReportsGraph(dummyReport);
    }

    function createCareReportsGraph(report) {

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

      var chartData = CareReportsGraphService.getBaseSerialGraph(report, valueAxes, getGraphs(report), 'createdTime', catAxis, exportReport, chartCursor);

      return AmCharts.makeChart(report.divId, chartData);
    }

    function getGraphs(report) {
      var graphs = [];

      for (var i = 0; i < report.valueFields.length; i++) {
        graphs.push(CareReportsGraphService.getBaseVariable('graph'));
        graphs[i].title = report.legendTitles[i];
        graphs[i].fillColors = report.colors[i];
        graphs[i].lineColor = report.colors[i];
        graphs[i].valueField = report.valueFields[i];
        graphs[i].balloonText = report.balloonText;
        graphs[i].fillAlphas = report.fillAlphas;
        graphs[i].showBalloon = report.showBalloon[i];
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
