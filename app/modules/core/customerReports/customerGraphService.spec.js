'use strict';

describe('Service: Customer Graph Service', function () {
  var CustomerGraphService;
  var activeUsersChart, avgRoomsChart, filesSharedChart, mediaChart, metricsChart, devicesChart;
  var validateService = {
    validate: function () {}
  };

  var dummyData = getJSONFixture('core/json/partnerReports/dummyReportData.json');
  var dummyActiveUserData = angular.copy(dummyData.activeUser.one);
  var dummyAvgRoomsData = angular.copy(dummyData.avgRooms.one);
  var dummyFilesSharedData = angular.copy(dummyData.filesShared.one);
  var dummyMediaData = angular.copy(dummyData.mediaQuality.one);
  var metricsData = getJSONFixture('core/json/customerReports/callMetrics.json');
  var devicesJson = getJSONFixture('core/json/customerReports/devices.json');
  var deviceResponse = angular.copy(devicesJson.response.graphData);

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
      expect(validateService.validate).not.toHaveBeenCalled();
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
      expect(validateService.validate).not.toHaveBeenCalled();
    });

    it('should update graph when setAvgRoomsGraph is called a second time', function () {
      CustomerGraphService.setAvgRoomsGraph(dummyAvgRoomsData, avgRoomsChart);
      expect(validateService.validate).toHaveBeenCalled();
    });
  });

  describe('Files Shared graph services', function () {
    beforeEach(function () {
      spyOn(AmCharts, 'makeChart').and.returnValue({
        'dataProvider': dummyFilesSharedData,
        validateData: validateService.validate
      });
      filesSharedChart = null;
      filesSharedChart = CustomerGraphService.setFilesSharedGraph(dummyFilesSharedData, filesSharedChart);
    });

    it('should have created a graph when setFilesSharedGraph is called the first time', function () {
      expect(AmCharts.makeChart).toHaveBeenCalled();
      expect(validateService.validate).not.toHaveBeenCalled();
    });

    it('should update graph when setFilesSharedGraph is called a second time', function () {
      CustomerGraphService.setFilesSharedGraph(dummyFilesSharedData, filesSharedChart);
      expect(validateService.validate).toHaveBeenCalled();
    });
  });

  describe('Media Quality graph services', function () {
    beforeEach(function () {
      spyOn(AmCharts, 'makeChart').and.returnValue({
        'dataProvider': dummyMediaData,
        validateData: validateService.validate
      });
      mediaChart = null;
      mediaChart = CustomerGraphService.setMediaQualityGraph(dummyMediaData, mediaChart, {
        value: 0
      });
    });

    it('should have created a graph when setMediaQualityGraph is called the first time', function () {
      expect(AmCharts.makeChart).toHaveBeenCalled();
      expect(validateService.validate).not.toHaveBeenCalled();
    });

    it('should update graph when setMediaQualityGraph is called a second time', function () {
      CustomerGraphService.setMediaQualityGraph(dummyMediaData, mediaChart, {
        value: 0
      });
      expect(validateService.validate).toHaveBeenCalled();
    });
  });

  describe('Call Metrics graph services', function () {
    beforeEach(function () {
      spyOn(AmCharts, 'makeChart').and.returnValue({
        'dataProvider': metricsData.response,
        validateData: validateService.validate
      });
      metricsChart = null;
      metricsChart = CustomerGraphService.setMetricsGraph(metricsData.response, metricsChart);
    });

    it('should have created a graph when setMetricsGraph is called the first time', function () {
      expect(AmCharts.makeChart).toHaveBeenCalled();
      expect(validateService.validate).not.toHaveBeenCalled();
    });

    it('should update graph when setMetricsGraph is called a second time', function () {
      CustomerGraphService.setMetricsGraph(metricsData.response, metricsChart);
      expect(validateService.validate).toHaveBeenCalled();
    });
  });

  describe('Registered Devices graph services', function () {
    beforeEach(function () {
      spyOn(AmCharts, 'makeChart').and.returnValue({
        'dataProvider': deviceResponse,
        validateData: validateService.validate
      });
      devicesChart = null;
      devicesChart = CustomerGraphService.setDeviceGraph(deviceResponse, devicesChart, {
        value: 0
      });
    });

    it('should have created a graph when setDeviceGraph is called the first time', function () {
      expect(AmCharts.makeChart).toHaveBeenCalled();
      expect(validateService.validate).not.toHaveBeenCalled();
    });

    it('should update graph when setDeviceGraph is called a second time', function () {
      CustomerGraphService.setDeviceGraph(deviceResponse, devicesChart, {
        value: 1
      });
      expect(validateService.validate).toHaveBeenCalled();
    });
  });
});
