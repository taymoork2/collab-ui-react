'use strict';

describe('Service: Graph Service', function () {
  var GraphService;
  var activeUsersChart;
  var mediaQualityChart;
  var validateService = {
    validate: function () {}
  };

  var dummyGraphData = getJSONFixture('core/json/partnerReports/dummyGraphData.json');
  var mediaQualityGraphData = getJSONFixture('core/json/partnerReports/mediaQualityGraphData.json');

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
      activeUsersChart = GraphService.updateActiveUsersGraph(dummyGraphData, activeUsersChart);
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
});
