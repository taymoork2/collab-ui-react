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
  });
});
