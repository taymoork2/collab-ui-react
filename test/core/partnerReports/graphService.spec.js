'use strict';

describe('Service: Graph Service', function () {
  var GraphService;
  var activeUsersChart, mediaQualityChart, activeUserPopulationChart;
  var validateService = {
    validate: function () {}
  };

  var dummyGraphData = getJSONFixture('core/json/partnerReports/dummyGraphData.json');
  var mediaQualityGraphData = {
    totalDurationSum: 200,
    goodQualityDurationSum: 194,
    fairQualityDurationSum: 5,
    poorQualityDurationSum: 1,
    date: '2015-07-30T00:00:00-05:00',
    modifiedDate: 'Jul 30, 2015'
  };
  var dummyPopulationData = [{
    customerName: "Dummy Customer",
    percentage: 0
  }];

  beforeEach(module('Core'));

  beforeEach(inject(function (_GraphService_) {
    GraphService = _GraphService_;

    spyOn(validateService, 'validate');
  }));

  it('should exist', function () {
    expect(GraphService).toBeDefined();
  });

  describe('Active Users graph services', function () {
    beforeEach(function () {
      spyOn(AmCharts, 'makeChart').and.returnValue({
        'dataProvider': dummyGraphData,
        validateData: validateService.validate
      });
      activeUsersChart = GraphService.createActiveUsersGraph(dummyGraphData);
    });

    it('should have created a graph', function () {
      expect(AmCharts.makeChart).toHaveBeenCalled();
    });

    it('should update graph when updateActiveUsersGraph is called', function () {
      GraphService.updateActiveUsersGraph(dummyGraphData, activeUsersChart);
      expect(validateService.validate).toHaveBeenCalled();
    });
  });

  describe('Media Quality graph services', function () {
    beforeEach(function () {
      spyOn(AmCharts, 'makeChart').and.returnValue({
        'dataProvider': mediaQualityGraphData,
        validateData: validateService.validate
      });
      mediaQualityChart = GraphService.createMediaQualityGraph(mediaQualityGraphData);
    });

    it('should have created a graph', function () {
      expect(AmCharts.makeChart).toHaveBeenCalled();
    });

    it('should update graph when updateMediaQualityGraph is called', function () {
      GraphService.updateMediaQualityGraph(mediaQualityGraphData, mediaQualityChart);
      expect(validateService.validate).toHaveBeenCalled();
    });
  });

  describe('Active User Population graph services', function () {
    beforeEach(function () {
      spyOn(AmCharts, 'makeChart').and.returnValue({
        'dataProvider': dummyPopulationData,
        validateData: validateService.validate
      });
      activeUserPopulationChart = GraphService.createActiveUserPopulationGraph(dummyPopulationData, 37);
    });

    it('should have created a graph', function () {
      expect(AmCharts.makeChart).toHaveBeenCalled();
    });

    it('should update graph when updateActiveUsersGraph is called', function () {
      GraphService.updateActiveUserPopulationGraph(dummyPopulationData, activeUserPopulationChart, 15);
      expect(validateService.validate).toHaveBeenCalled();
    });
  });
});
