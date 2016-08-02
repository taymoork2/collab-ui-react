'use strict';

describe('Service: Graph Service', function () {
  var GraphService;
  var activeUsersChart, mediaQualityChart, activeUserPopulationChart, donutChart;
  var validateService = {
    validate: function () {},
    validateNow: function (varOne, varTwo) {}
  };

  var dummyData = getJSONFixture('core/json/partnerReports/dummyReportData.json');
  var dummyActiveUserData = angular.copy(dummyData.activeUser.one);
  var mediaQualityGraphData = angular.copy(dummyData.activeUser.one);
  var dummyPopulationData = angular.copy(dummyData.activeUserPopulation);
  var callMetricsData = angular.copy(dummyData.callMetrics);

  beforeEach(angular.mock.module('Core'));

  beforeEach(inject(function (_GraphService_) {
    GraphService = _GraphService_;

    spyOn(validateService, 'validate');
    spyOn(validateService, 'validateNow');
  }));

  it('should exist', function () {
    expect(GraphService).toBeDefined();
  });

  describe('Active Users graph services', function () {
    beforeEach(function () {
      spyOn(AmCharts, 'makeChart').and.returnValue({
        'dataProvider': dummyActiveUserData,
        validateData: validateService.validate
      });
      activeUsersChart = null;
      activeUsersChart = GraphService.getActiveUsersGraph(dummyActiveUserData, activeUsersChart);
    });

    it('should have created a graph when getActiveUsersGraph is called the first time', function () {
      expect(AmCharts.makeChart).toHaveBeenCalled();
      expect(validateService.validate).not.toHaveBeenCalled();
    });

    it('should update graph when getActiveUsersGraph is called a second time', function () {
      GraphService.getActiveUsersGraph(dummyActiveUserData, activeUsersChart);
      expect(validateService.validate).toHaveBeenCalled();
    });
  });

  describe('Active User Population graph services', function () {
    beforeEach(function () {
      spyOn(AmCharts, 'makeChart').and.returnValue({
        'dataProvider': dummyPopulationData,
        validateData: validateService.validate
      });
      activeUserPopulationChart = null;
      activeUserPopulationChart = GraphService.getActiveUserPopulationGraph(dummyPopulationData, activeUserPopulationChart);
    });

    it('should have created a graph when getActiveUserPopulationGraph is called the first time', function () {
      expect(AmCharts.makeChart).toHaveBeenCalled();
      expect(validateService.validate).not.toHaveBeenCalled();
    });

    it('should update graph when getActiveUserPopulationGraph is called a second time', function () {
      GraphService.getActiveUserPopulationGraph(dummyPopulationData, activeUserPopulationChart);
      expect(validateService.validate).toHaveBeenCalled();
    });
  });

  describe('Media Quality graph services', function () {
    beforeEach(function () {
      spyOn(AmCharts, 'makeChart').and.returnValue({
        'dataProvider': mediaQualityGraphData,
        validateData: validateService.validate
      });
      mediaQualityChart = null;
      mediaQualityChart = GraphService.getMediaQualityGraph(mediaQualityGraphData, mediaQualityChart);
    });

    it('should have created a graph when getMediaQualityGraph is called the first time', function () {
      expect(AmCharts.makeChart).toHaveBeenCalled();
      expect(validateService.validate).not.toHaveBeenCalled();
    });

    it('should update graph when getMediaQualityGraph is called a second time', function () {
      GraphService.getMediaQualityGraph(mediaQualityGraphData, mediaQualityChart);
      expect(validateService.validate).toHaveBeenCalled();
    });
  });

  describe('Call Metrics graph services', function () {
    beforeEach(function () {
      spyOn(AmCharts, 'makeChart').and.returnValue({
        'dataProvider': callMetricsData,
        validateNow: validateService.validateNow
      });
      donutChart = null;
      donutChart = GraphService.getCallMetricsDonutChart(callMetricsData, donutChart);
    });

    it('should have created a graph when getCallMetricsDonutChart is called the first time', function () {
      expect(AmCharts.makeChart).toHaveBeenCalled();
      expect(validateService.validateNow).not.toHaveBeenCalled();
    });

    it('should update graph when getCallMetricsDonutChart is called a second time', function () {
      GraphService.getCallMetricsDonutChart(callMetricsData, donutChart);
      expect(validateService.validateNow).toHaveBeenCalledWith(true, false);
    });
  });
});
