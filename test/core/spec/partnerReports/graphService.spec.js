'use strict';

describe('Service: Graph Service', function () {
  var GraphService;
  var validateService = {
    invalidate: function () {},
    validate: function () {}
  };

  var dummyGraphData = getJSONFixture('core/json/partnerReports/dummyGraphData.json');

  beforeEach(module('Core'));

  beforeEach(inject(function (_GraphService_) {
    GraphService = _GraphService_;

    spyOn(validateService, 'invalidate');
    spyOn(validateService, 'validate');
    spyOn(AmCharts, 'makeChart').and.returnValue({
      'dataProvider': dummyGraphData,
      invalidateSize: validateService.invalidate,
      validateData: validateService.validate
    });
  }));

  it('should exist', function () {
    expect(GraphService).toBeDefined();
  });

  describe('Active Users graph services', function () {
    beforeEach(function () {
      GraphService.createActiveUserGraph(dummyGraphData);
    });

    it('should have created a graph', function () {
      expect(AmCharts.makeChart).toHaveBeenCalled();
    });

    it('should invalidate graph size when invalidateActiveUserGraphSize is called', function () {
      GraphService.invalidateActiveUserGraphSize();
      expect(validateService.invalidate).toHaveBeenCalled();
    });

    it('should update graph when updateActiveUsersGraph is called', function () {
      GraphService.updateActiveUsersGraph(dummyGraphData);
      expect(validateService.validate).toHaveBeenCalled();
      expect(validateService.invalidate).toHaveBeenCalled();
    });
  });
});
