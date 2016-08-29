'use strict';

describe('Service: Care Reports Service', function () {
  var CareReportsService;
  var responseData = getJSONFixture('sunlight/json/careReportGraphServiceResponse.json');

  beforeEach(angular.mock.module('Sunlight'));

  beforeEach(inject(function (_CareReportsService_) {
    CareReportsService = _CareReportsService_;
  }));

  it('should exist', function () {
    expect(CareReportsService).toBeDefined();
  });

  describe('Task Incoming graph services', function () {
    beforeEach(function () {
      spyOn(AmCharts, 'makeChart').and.returnValue({
        'dataProvider': {}
      });

    });

    it('should have created a graph when showTaskIncomingDummy is called', function () {
      CareReportsService.showTaskIncomingDummy('taskIncomingdiv', 'dummyData', 'dummyData', true);
      expect(AmCharts.makeChart).toHaveBeenCalled();
    });

    it('should have created a graph when showTaskTimeDummy is called', function () {
      CareReportsService.showTaskTimeDummy('taskTimeDiv', 'dummyData', 'dummyData');
      expect(AmCharts.makeChart).toHaveBeenCalled();
    });

    it('should have created a graph when showAverageCsatDummy is called', function () {
      CareReportsService.showAverageCsatDummy('averageCsatDiv', 'dummyData', 'dummyData');
      expect(AmCharts.makeChart).toHaveBeenCalled();
    });

    it('should have created a graph when showTaskAggregateDummy is called', function () {
      CareReportsService.showTaskAggregateDummy('taskAggregateDiv', 'dummyData', 'dummyData');
      expect(AmCharts.makeChart).toHaveBeenCalled();
    });

    it('should have created a graph when showTaskIncomingGraph is called', function () {
      CareReportsService.showTaskIncomingGraph('taskIncomingdiv', 'dummyData', 'dummyData', true);
      expect(AmCharts.makeChart).toHaveBeenCalled();
    });

    it('should have created a graph when showTaskTimeGraph is called', function () {
      CareReportsService.showTaskTimeGraph('taskTimeDiv', 'dummyData', 'dummyData');
      expect(AmCharts.makeChart).toHaveBeenCalled();
    });

    it('should have created a graph when showAverageCsatGraph is called', function () {
      CareReportsService.showAverageCsatGraph('averageCsatDiv', 'dummyData', 'dummyData');
      expect(AmCharts.makeChart).toHaveBeenCalled();
    });

    it('should have created a graph when showTaskAggregateGraph is called', function () {
      CareReportsService.showTaskAggregateGraph('taskAggregateDiv', 'dummyData', 'dummyData');
      expect(AmCharts.makeChart).toHaveBeenCalled();
    });

    it('Task Incoming Chart Config should return expected Report for Today', function () {
      var taskIncomingReport = CareReportsService.getTaskIncomingGraphConfig('dummyData', 'dummyTitle', true);
      var expectedConfig = responseData.taskIncomingReportToday;
      _.map(taskIncomingReport.graphs, function (graph) {
        graph.balloonFunction = undefined;
      });
      _.map(expectedConfig.graphs, function (graph) {
        graph.balloonFunction = undefined;
      });
      expect(taskIncomingReport).toEqual(expectedConfig);
    });

    it('Task Incoming Chart Config should return expected Report for Past', function () {
      var taskIncomingReport = CareReportsService.getTaskIncomingGraphConfig('dummyData', 'dummyTitle', false);
      var expectedConfig = responseData.taskIncomingReportToday;
      expectedConfig.legend.equalWidths = true;
      expectedConfig.graphs = _.filter(expectedConfig.graphs, function (graph) {
        if (graph.title === 'careReportsPage.handled' || graph.title === 'careReportsPage.abandoned') {
          return true;
        }
      });
      _.map(taskIncomingReport.graphs, function (graph) {
        graph.balloonFunction = undefined;
      });
      _.map(expectedConfig.graphs, function (graph) {
        graph.balloonFunction = undefined;
      });
      expect(taskIncomingReport).toEqual(expectedConfig);
    });

    it('Task Time Chart Config should return expected Report', function () {
      var taskTimeReport = CareReportsService.getTaskTimeGraphConfig('dummyData', 'dummyTitle');
      var expectedConfig = responseData.taskIncomingReportToday;
      expectedConfig.graphs = responseData.taskTimeGraphs;
      _.map(expectedConfig.valueAxes, function (axis) {
        axis.title = 'careReportsPage.taskTimeLabel';
      });
      _.map(taskTimeReport.graphs, function (graph) {
        graph.balloonFunction = undefined;
      });
      _.map(expectedConfig.graphs, function (graph) {
        graph.balloonFunction = undefined;
      });
      expect(taskTimeReport).toEqual(expectedConfig);
    });

    it('Average Csat Chart Config should return expected Report', function () {
      var averageCsatReport = CareReportsService.getAverageCsatGraphConfig('dummyData', 'dummyTitle', false);
      var expectedConfig = responseData.taskIncomingReportToday;
      expectedConfig.graphs = responseData.csatGraphs;
      _.map(expectedConfig.valueAxes, function (axis) {
        axis.title = 'careReportsPage.csatRating';
      });
      _.map(averageCsatReport.graphs, function (graph) {
        graph.balloonFunction = undefined;
      });
      _.map(expectedConfig.graphs, function (graph) {
        graph.balloonFunction = undefined;
      });
      expect(averageCsatReport).toEqual(expectedConfig);
    });

    it('Task Aggregate Chart Config should return expected Report', function () {
      var taskAggregateReport = CareReportsService.getTaskAggregateGraphConfig('dummyData', 'dummyTitle', false);
      var expectedConfig = responseData.taskIncomingReportToday;
      expectedConfig.graphs = responseData.taskAggregateGraphs;
      _.map(expectedConfig.valueAxes, function (axis) {
        axis.title = 'careReportsPage.tasks';
      });
      _.map(taskAggregateReport.graphs, function (graph) {
        graph.balloonFunction = undefined;
      });
      _.map(expectedConfig.graphs, function (graph) {
        graph.balloonFunction = undefined;
      });
      expect(taskAggregateReport).toEqual(expectedConfig);
    });
  });
});
