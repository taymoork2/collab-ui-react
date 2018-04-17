'use strict';

describe('Service: Care Reports Service', function () {
  var CareReportsService;
  var responseData = getJSONFixture('sunlight/json/careReportGraphServiceResponse.json');
  var dummyTitle = undefined;

  beforeEach(angular.mock.module('Sunlight'));

  beforeEach(inject(function (_CareReportsService_) {
    CareReportsService = _CareReportsService_;
  }));

  it('should exist', function () {
    expect(CareReportsService).toBeDefined();
  });

  describe('Graph services', function () {
    beforeEach(function () {
      spyOn(AmCharts, 'makeChart').and.returnValue({
        dataProvider: {},
      });
    });

    function verifyReportConfig(taskReportConfig, expectedConfig, axisTitle) {
      _.map(expectedConfig.valueAxes, function (axis) {
        axis.title = 'careReportsPage.' + axisTitle;
      });
      _.map(taskReportConfig.graphs, function (graph) {
        graph.balloonFunction = undefined;
      });
      _.map(expectedConfig.graphs, function (graph) {
        graph.balloonFunction = undefined;
      });
      expect(taskReportConfig).toEqual(expectedConfig);
    }

    it('should have created a graph when showTaskIncomingDummy is called', function () {
      CareReportsService.showTaskIncomingDummy('taskIncomingdiv', 'taskIncomingBreakdownDiv', 'dummyData', 'dummyData', dummyTitle);
      expect(AmCharts.makeChart).toHaveBeenCalled();
    });

    it('should have created a graph when showTaskOfferedDummy is called', function () {
      CareReportsService.showTaskOfferedDummy('taskOffereddiv', 'dummyData', 'dummyData', dummyTitle);
      expect(AmCharts.makeChart).toHaveBeenCalled();
    });

    it('should have created a graph when showTaskTimeDummy is called', function () {
      CareReportsService.showTaskTimeDummy('taskTimeDiv', 'taskTimeBreakdownDiv', 'dummyData', 'dummyData', dummyTitle);
      expect(AmCharts.makeChart).toHaveBeenCalled();
    });

    it('should have created a graph when showAverageCsatDummy is called', function () {
      CareReportsService.showAverageCsatDummy('averageCsatDiv', 'averageCsatBreakdownDiv', 'dummyData', 'dummyData', dummyTitle);
      expect(AmCharts.makeChart).toHaveBeenCalled();
    });

    it('should have created a graph when showTaskAggregateDummy is called', function () {
      CareReportsService.showTaskAggregateDummy('taskAggregateDiv', 'taskAggregateBreakdownDiv', 'dummyData', 'dummyData', dummyTitle);
      expect(AmCharts.makeChart).toHaveBeenCalled();
    });

    it('should have created a graph when showTaskIncomingGraph is called', function () {
      CareReportsService.showTaskIncomingGraph('taskIncomingdiv', 'taskIncomingBreakdownDiv', 'dummyData', 'dummyData', dummyTitle);
      expect(AmCharts.makeChart).toHaveBeenCalled();
    });

    it('should have created a graph when showTaskOfferedGraph is called', function () {
      CareReportsService.showTaskOfferedGraph('taskOffereddiv', 'dummyData', 'dummyData', dummyTitle);
      expect(AmCharts.makeChart).toHaveBeenCalled();
    });

    it('should have created a graph when showTaskTimeGraph is called', function () {
      CareReportsService.showTaskTimeGraph('taskTimeDiv', 'taskTimeBreakdownDiv', 'dummyData', 'dummyData', dummyTitle);
      expect(AmCharts.makeChart).toHaveBeenCalled();
    });

    it('should have created a graph when showAverageCsatGraph is called', function () {
      CareReportsService.showAverageCsatGraph('averageCsatDiv', 'averageCsatBreakdownDiv', 'dummyData', 'dummyData', 'dummyTitle');
      expect(AmCharts.makeChart).toHaveBeenCalled();
    });

    it('should have created a graph when showTaskAggregateGraph is called', function () {
      CareReportsService.showTaskAggregateGraph('taskAggregateDiv', 'taskAggregateBreakdownDiv', 'dummyData', 'dummyData', 'dummyTitle');
      expect(AmCharts.makeChart).toHaveBeenCalled();
    });

    it('Task Incoming Chart Config should return expected Report for Today', function () {
      var taskIncomingReport = CareReportsService.getTaskIncomingGraphConfig('dummyData', 'dummyTitle', 'dummyTitle',
        false, 'abandoned', 'handled', 'numTasksAbandonedState', 'numTasksHandledState', '#F96452');
      var expectedConfig = _.clone(responseData.taskIncomingReportToday);
      verifyReportConfig(taskIncomingReport, expectedConfig, 'tasks');
    });

    it('Task Incoming Chart Config should return breakdown of Chat and ChatWithVideo Report for Today', function () {
      var taskIncomingBreakdownReport = CareReportsService.getTaskIncomingGraphConfig('dummyData', 'dummyTitle', 'dummyTitle',
        true, 'chatWithVideo', 'chat', 'numWebcallTasksHandled', 'numChatTasksHandled', '#F96452');
      var expectedConfig = _.clone(responseData.taskIncomingReportToday);
      expectedConfig.graphs = responseData.taskIncomingBreakdownGraphs;
      verifyReportConfig(taskIncomingBreakdownReport, expectedConfig, 'tasks');
    });

    it('Task Offered Chart Config should return expected Report for Today', function () {
      var taskOfferedReport = CareReportsService.getTaskOfferedGraphConfig('dummyData', 'dummyTitle', 'dummyTitle', true);
      var expectedConfig = _.clone(responseData.taskOfferedReportToday);
      verifyReportConfig(taskOfferedReport, expectedConfig, 'percentage');
    });

    it('Task Incoming Chart Config should return expected Report for Past', function () {
      var taskIncomingReport = CareReportsService.getTaskIncomingGraphConfig('dummyData', 'dummyTitle', 'dummyTitle',
        false, 'abandoned', 'handled', 'numTasksAbandonedState', 'numTasksHandledState', '#F96452');
      var expectedConfig = _.clone(responseData.taskIncomingReportToday);
      verifyReportConfig(taskIncomingReport, expectedConfig, 'tasks');
    });

    it('Task Incoming Chart Config should return breakdown of chat and chatWithVideo Report for Past', function () {
      var taskIncomingBreakdownReport = CareReportsService.getTaskIncomingGraphConfig('dummyData', 'dummyTitle', 'dummyTitle',
        true, 'chatWithVideo', 'chat', 'numWebcallTasksHandled', 'numChatTasksHandled', '#F96452');
      var expectedConfig = _.clone(responseData.taskIncomingReportToday);
      expectedConfig.graphs = responseData.taskIncomingBreakdownGraphs;
      verifyReportConfig(taskIncomingBreakdownReport, expectedConfig, 'tasks');
    });

    it('Task Time Chart Config should return expected Report', function () {
      var taskTimeReport = CareReportsService.getTaskTimeGraphConfig('dummyData', 'dummyTitle', 'dummyTitle', false,
        'queueTime', 'handleTime', 'avgTaskWaitTime', 'avgTaskCloseTime', '#F5A623');
      var expectedConfig = _.clone(responseData.taskIncomingReportToday);
      expectedConfig.graphs = responseData.taskTimeGraphs;
      verifyReportConfig(taskTimeReport, expectedConfig, 'taskTimeLabel');
    });

    it('Task Time Chart Config should return breakdown of Chat and ChatWithVideo Report', function () {
      var taskTimeBreakdownReport = CareReportsService.getTaskTimeGraphConfig('dummyData', 'dummyTitle', 'dummyTitle', true,
        'chatWithVideo', 'chat', 'avgWebcallTaskCloseTime', 'avgChatTaskCloseTime', '#F5A623');
      var expectedConfig = _.clone(responseData.taskIncomingReportToday);
      expectedConfig.graphs = responseData.taskTimeBreakdownGraphs;
      verifyReportConfig(taskTimeBreakdownReport, expectedConfig, 'taskTimeLabel');
    });

    it('Average Csat Chart Config should return expected Report', function () {
      var averageCsatReport = CareReportsService.getAverageCsatGraphConfig('dummyData', 'dummyTitle', 'dummyTitle',
        false, 'averageCsat', '', 'avgCsatScores', '', '#43A942');
      var expectedConfig = _.clone(responseData.taskAverageCsat);
      expectedConfig.graphs = responseData.taskAverageCsat.graphs;
      verifyReportConfig(averageCsatReport, expectedConfig, 'csatRating');
    });

    it('Average Csat Chart Config should return breakdown of Chat and chatWithVideo Report', function () {
      var averageCsatBreakdownReport = CareReportsService.getAverageCsatGraphConfig('dummyData', 'dummyTitle', 'dummyTitle',
        true, 'chatWithVideo', 'chat', 'avgWebcallCsatScores', 'avgChatCsatScores', '#43A942');
      var expectedConfig = _.clone(responseData.taskAverageCsat);
      expectedConfig.graphs = responseData.taskAverageCsatBreakdownGraphs;
      expectedConfig.legend = responseData.taskIncomingReportToday.legend;
      verifyReportConfig(averageCsatBreakdownReport, expectedConfig, 'csatRating');
    });

    it('Task Aggregate Chart Config should return expected Report', function () {
      var taskAggregateReport = CareReportsService.getTaskAggregateGraphConfig('dummyData', 'dummyTitle', 'dummyTitle',
        'in-queue', 'assigned', 'numPendingTasks', 'numWorkingTasks', '#F5A623', '#F5A623');
      var expectedConfig = _.clone(responseData.taskIncomingReportToday);
      expectedConfig.graphs = responseData.taskAggregateGraphs;
      verifyReportConfig(taskAggregateReport, expectedConfig, 'tasks');
    });
  });
});
