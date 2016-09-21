'use strict';

describe('Service: Customer Graph Service', function () {
  var CustomerGraphService;
  var validateService = {
    validate: function () {}
  };
  var activeOptions = [{
    value: 0
  }, {
    value: 1
  }];

  var dummyData = getJSONFixture('core/json/partnerReports/dummyReportData.json');
  var dummyActiveUserData = _.clone(dummyData.activeUser.one);
  var dummyAvgRoomsData = _.clone(dummyData.avgRooms.one);
  var dummyFilesSharedData = _.clone(dummyData.filesShared.one);
  var dummyMediaData = _.clone(dummyData.mediaQuality.one);
  var metricsData = getJSONFixture('core/json/customerReports/callMetrics.json');
  var devicesJson = getJSONFixture('core/json/customerReports/devices.json');
  var deviceResponse = _.clone(devicesJson.response.graphData);

  beforeEach(angular.mock.module('Core'));

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
        categoryAxis: {
          gridColor: 'color'
        },
        chartCursor: {
          valueLineEnabled: true
        },
        graphs: [],
        dataProvider: dummyActiveUserData,
        validateData: validateService.validate
      });
    });

    it('should have created a line graph when setActiveLineGraph is called the first time', function () {
      CustomerGraphService.setActiveLineGraph(dummyActiveUserData, null, activeOptions[0]);
      expect(AmCharts.makeChart).toHaveBeenCalled();
      expect(validateService.validate).not.toHaveBeenCalled();
    });

    it('should update graph when setActiveLineGraph is called a second time', function () {
      var chart = CustomerGraphService.setActiveLineGraph(dummyActiveUserData, null, activeOptions[0]);
      CustomerGraphService.setActiveLineGraph(dummyActiveUserData, chart, activeOptions[1]);
      expect(validateService.validate).toHaveBeenCalled();
    });

    it('should have created a graph when setActiveUsersGraph is called the first time', function () {
      CustomerGraphService.setActiveUsersGraph(dummyActiveUserData, null);
      expect(AmCharts.makeChart).toHaveBeenCalled();
      expect(validateService.validate).not.toHaveBeenCalled();
    });

    it('should update graph when setActiveUsersGraph is called a second time', function () {
      var chart = CustomerGraphService.setActiveUsersGraph(dummyActiveUserData, null);
      CustomerGraphService.setActiveUsersGraph(dummyActiveUserData, chart);
      expect(validateService.validate).toHaveBeenCalled();
    });
  });

  describe('Total Rooms graph services', function () {
    beforeEach(function () {
      spyOn(AmCharts, 'makeChart').and.returnValue({
        'dataProvider': dummyAvgRoomsData,
        validateData: validateService.validate
      });
    });

    it('should have created a graph when setAvgRoomsGraph is called the first time', function () {
      CustomerGraphService.setAvgRoomsGraph(dummyAvgRoomsData, null);
      expect(AmCharts.makeChart).toHaveBeenCalled();
      expect(validateService.validate).not.toHaveBeenCalled();
    });

    it('should update graph when setAvgRoomsGraph is called a second time', function () {
      var chart = CustomerGraphService.setAvgRoomsGraph(dummyAvgRoomsData, null);
      CustomerGraphService.setAvgRoomsGraph(dummyAvgRoomsData, chart);
      expect(validateService.validate).toHaveBeenCalled();
    });
  });

  describe('Files Shared graph services', function () {
    beforeEach(function () {
      spyOn(AmCharts, 'makeChart').and.returnValue({
        'dataProvider': dummyFilesSharedData,
        validateData: validateService.validate
      });
    });

    it('should have created a graph when setFilesSharedGraph is called the first time', function () {
      CustomerGraphService.setFilesSharedGraph(dummyFilesSharedData, null);
      expect(AmCharts.makeChart).toHaveBeenCalled();
      expect(validateService.validate).not.toHaveBeenCalled();
    });

    it('should update graph when setFilesSharedGraph is called a second time', function () {
      var chart = CustomerGraphService.setFilesSharedGraph(dummyFilesSharedData, null);
      CustomerGraphService.setFilesSharedGraph(dummyFilesSharedData, chart);
      expect(validateService.validate).toHaveBeenCalled();
    });
  });

  describe('Media Quality graph services', function () {
    beforeEach(function () {
      spyOn(AmCharts, 'makeChart').and.returnValue({
        'dataProvider': dummyMediaData,
        validateData: validateService.validate
      });
    });

    it('should have created a graph when setMediaQualityGraph is called the first time', function () {
      CustomerGraphService.setMediaQualityGraph(dummyMediaData, null, {
        value: 0
      });
      expect(AmCharts.makeChart).toHaveBeenCalled();
      expect(validateService.validate).not.toHaveBeenCalled();
    });

    it('should update graph when setMediaQualityGraph is called a second time', function () {
      var chart = CustomerGraphService.setMediaQualityGraph(dummyMediaData, null, {
        value: 0
      });
      CustomerGraphService.setMediaQualityGraph(dummyMediaData, chart, {
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
    });

    it('should have created a graph when setMetricsGraph is called the first time', function () {
      CustomerGraphService.setMetricsGraph(metricsData.response, null);
      expect(AmCharts.makeChart).toHaveBeenCalled();
      expect(validateService.validate).not.toHaveBeenCalled();
    });

    it('should update graph when setMetricsGraph is called a second time', function () {
      var chart = CustomerGraphService.setMetricsGraph(metricsData.response, null);
      CustomerGraphService.setMetricsGraph(metricsData.response, chart);
      expect(validateService.validate).toHaveBeenCalled();
    });
  });

  describe('Registered Devices graph services', function () {
    beforeEach(function () {
      spyOn(AmCharts, 'makeChart').and.returnValue({
        'dataProvider': deviceResponse,
        validateData: validateService.validate
      });
    });

    it('should have created a graph when setDeviceGraph is called the first time', function () {
      CustomerGraphService.setDeviceGraph(deviceResponse, null, {
        value: 0
      });
      expect(AmCharts.makeChart).toHaveBeenCalled();
      expect(validateService.validate).not.toHaveBeenCalled();
    });

    it('should update graph when setDeviceGraph is called a second time', function () {
      var chart = CustomerGraphService.setDeviceGraph(deviceResponse, null, {
        value: 0
      });
      CustomerGraphService.setDeviceGraph(deviceResponse, chart, {
        value: 1
      });
      expect(validateService.validate).toHaveBeenCalled();
    });
  });
});
