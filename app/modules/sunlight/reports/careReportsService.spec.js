'use strict';

describe('Service: Care Reports Service', function () {
  var CareReportsService;

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

      CareReportsService.setTaskIncomingGraphs('dummyData', 'dummyData');
    });

    it('should have created a graph when setTaskIncomingGraphs is called', function () {
      expect(AmCharts.makeChart).toHaveBeenCalled();
    });

  });
});
