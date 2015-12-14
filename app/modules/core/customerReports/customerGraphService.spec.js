'use strict';

describe('Service: Customer Graph Service', function () {
  var CustomerGraphService;
  var activeUsersChart, avgRoomsChart;
  var validateService = {
    validate: function () {}
  };

  var dummyData = getJSONFixture('core/json/partnerReports/dummyReportData.json');
  var dummyActiveUserData = angular.copy(dummyData.activeUser.four);
  var dummyAvgRoomsData = angular.copy(dummyData.avgRooms.one);

  beforeEach(module('Core'));

  beforeEach(inject(function (_CustomerGraphService_) {
    CustomerGraphService = _CustomerGraphService_;

    spyOn(validateService, 'validate');
  }));

  it('should exist', function () {
    expect(CustomerGraphService).toBeDefined();
  });

  describe('Active Users graph services', function () {
    beforeEach(function () {
      spyOn(AmCharts, 'makeChart').and.returnValue({
        'dataProvider': dummyActiveUserData,
        validateData: validateService.validate
      });
      activeUsersChart = null;
      activeUsersChart = CustomerGraphService.setActiveUsersGraph(dummyActiveUserData, activeUsersChart);
    });

    it('should have created a graph when setActiveUsersGraph is called the first time', function () {
      expect(AmCharts.makeChart).toHaveBeenCalled();
    });

    it('should update graph when setActiveUsersGraph is called a second time', function () {
      CustomerGraphService.setActiveUsersGraph(dummyActiveUserData, activeUsersChart);
      expect(validateService.validate).toHaveBeenCalled();
    });
  });

  describe('Total Rooms graph services', function () {
    beforeEach(function () {
      spyOn(AmCharts, 'makeChart').and.returnValue({
        'dataProvider': dummyAvgRoomsData,
        validateData: validateService.validate
      });
      avgRoomsChart = null;
      avgRoomsChart = CustomerGraphService.setAvgRoomsGraph(dummyAvgRoomsData, avgRoomsChart);
    });

    it('should have created a graph when setAvgRoomsGraph is called the first time', function () {
      expect(AmCharts.makeChart).toHaveBeenCalled();
    });

    it('should update graph when setAvgRoomsGraph is called a second time', function () {
      CustomerGraphService.setAvgRoomsGraph(dummyAvgRoomsData, avgRoomsChart);
      expect(validateService.validate).toHaveBeenCalled();
    });
  });
});
