import sparkReports from './index';

describe('Service: Customer Graph Service', function () {
  beforeEach(function () {
    this.initModules(sparkReports);
    this.injectDependencies('SparkGraphService');

    this.activeUsers = getJSONFixture('core/json/customerReports/activeUser.json');
    this.avgRooms = getJSONFixture('core/json/customerReports/roomData.json');
    this.devicesJson = getJSONFixture('core/json/customerReports/devices.json');
    this.fileData = getJSONFixture('core/json/customerReports/fileData.json');
    this.mediaData = getJSONFixture('core/json/customerReports/mediaQuality.json');
    this.metricsData = getJSONFixture('core/json/customerReports/callMetrics.json');

    this.chart = {
      categoryAxis: {
        gridColor: 'color',
      },
      chartCursor: {
        valueLineEnabled: true,
      },
      graphs: [],
      legend: {
        valueText: undefined,
      },
      dataProvider: undefined,
      validateData: jasmine.createSpy('validateData'),
    };
  });

  describe('Active Users graph services', function () {
    beforeEach(function () {
      this.data = _.cloneDeep(this.activeUsers.dummyData.one);
      this.filter = _.cloneDeep(this.activeUsers.dropdownOptions);

      this.chart.dataProvider = this.data;
      spyOn(AmCharts, 'makeChart').and.returnValue(this.chart);
    });

    it('should have created a line graph when setActiveLineGraph is called the first time', function () {
      this.SparkGraphService.setActiveLineGraph(this.data, null, this.filter[0]);
      expect(AmCharts.makeChart).toHaveBeenCalled();
      expect(this.chart.validateData).not.toHaveBeenCalled();
    });

    it('should update graph when setActiveLineGraph is called a second time', function () {
      let chart = this.SparkGraphService.setActiveLineGraph(this.data, null, this.filter[0]);
      this.SparkGraphService.setActiveLineGraph(this.data, chart, this.filter[1]);
      expect(this.chart.validateData).toHaveBeenCalled();
    });

    it('should have created a graph when setActiveUsersGraph is called the first time', function () {
      this.SparkGraphService.setActiveUsersGraph(this.data, null);
      expect(AmCharts.makeChart).toHaveBeenCalled();
      expect(this.chart.validateData).not.toHaveBeenCalled();
    });

    it('should update graph when setActiveUsersGraph is called a second time', function () {
      let chart = this.SparkGraphService.setActiveUsersGraph(this.data, null);
      this.SparkGraphService.setActiveUsersGraph(this.data, chart);
      expect(this.chart.validateData).toHaveBeenCalled();
    });
  });

  describe('Total Rooms graph services', function () {
    beforeEach(function () {
      this.data = _.cloneDeep(this.avgRooms.response);

      this.chart.dataProvider = this.data;
      spyOn(AmCharts, 'makeChart').and.returnValue(this.chart);
    });

    it('should have created a graph when setAvgRoomsGraph is called the first time', function () {
      this.SparkGraphService.setAvgRoomsGraph(this.data, null);
      expect(AmCharts.makeChart).toHaveBeenCalled();
      expect(this.chart.validateData).not.toHaveBeenCalled();
    });

    it('should update graph when setAvgRoomsGraph is called a second time', function () {
      let chart = this.SparkGraphService.setAvgRoomsGraph(this.data, null);
      this.SparkGraphService.setAvgRoomsGraph(this.data, chart);
      expect(this.chart.validateData).toHaveBeenCalled();
    });

    it('should have created a graph when setRoomGraph is called the first time', function () {
      this.SparkGraphService.setRoomGraph(this.data, null);
      expect(AmCharts.makeChart).toHaveBeenCalled();
      expect(this.chart.validateData).not.toHaveBeenCalled();
    });

    it('should update graph when setRoomGraph is called a second time', function () {
      let chart = this.SparkGraphService.setRoomGraph(this.data, null);
      this.SparkGraphService.setRoomGraph(this.data, chart);
      expect(this.chart.validateData).toHaveBeenCalled();
    });
  });

  describe('Files Shared graph services', function () {
    beforeEach(function () {
      this.data = _.cloneDeep(this.fileData.response);

      this.chart.dataProvider = this.data;
      spyOn(AmCharts, 'makeChart').and.returnValue(this.chart);
    });

    it('should have created a graph when setFilesSharedGraph is called the first time', function () {
      this.SparkGraphService.setFilesSharedGraph(this.data, null);
      expect(AmCharts.makeChart).toHaveBeenCalled();
      expect(this.chart.validateData).not.toHaveBeenCalled();
    });

    it('should update graph when setFilesSharedGraph is called a second time', function () {
      let chart = this.SparkGraphService.setFilesSharedGraph(this.data, null);
      this.SparkGraphService.setFilesSharedGraph(this.data, chart);
      expect(this.chart.validateData).toHaveBeenCalled();
    });

    it('should have created a graph when setFilesGraph is called the first time', function () {
      this.SparkGraphService.setFilesGraph(this.data, null);
      expect(AmCharts.makeChart).toHaveBeenCalled();
      expect(this.chart.validateData).not.toHaveBeenCalled();
    });

    it('should update graph when setFilesGraph is called a second time', function () {
      let chart = this.SparkGraphService.setFilesGraph(this.data, null);
      this.SparkGraphService.setFilesGraph(this.data, chart);
      expect(this.chart.validateData).toHaveBeenCalled();
    });
  });

  describe('Media Quality graph services', function () {
    beforeEach(function () {
      this.data = _.cloneDeep(this.mediaData.response);
      this.filter = _.cloneDeep(this.mediaData.dropdownFilter);

      this.chart.dataProvider = this.data;
      spyOn(AmCharts, 'makeChart').and.returnValue(this.chart);
    });

    it('should have created a graph when setMediaQualityGraph is called the first time', function () {
      this.SparkGraphService.setMediaQualityGraph(this.data, null, this.filter[0]);
      expect(AmCharts.makeChart).toHaveBeenCalled();
      expect(this.chart.validateData).not.toHaveBeenCalled();
    });

    it('should update graph when setMediaQualityGraph is called a second time', function () {
      let chart = this.SparkGraphService.setMediaQualityGraph(this.data, null, this.filter[0]);
      this.SparkGraphService.setMediaQualityGraph(this.data, chart, this.filter[1]);
      expect(this.chart.validateData).toHaveBeenCalled();
    });

    it('should have created a graph when setQualityGraph is called the first time', function () {
      this.SparkGraphService.setQualityGraph(this.data, null, this.filter[0]);
      expect(AmCharts.makeChart).toHaveBeenCalled();
      expect(this.chart.validateData).not.toHaveBeenCalled();
    });

    it('should update graph when setQualityGraph is called a second time', function () {
      let chart = this.SparkGraphService.setQualityGraph(this.data, null, this.filter[0]);
      this.SparkGraphService.setQualityGraph(this.data, chart, this.filter[1]);
      expect(this.chart.validateData).toHaveBeenCalled();
    });
  });

  describe('Call Metrics graph services', function () {
    beforeEach(function () {
      spyOn(AmCharts, 'makeChart').and.returnValue({
        dataProvider: this.metricsData.response,
        validateData: this.chart.validateData,
      });
    });

    it('should have created a graph when setMetricsGraph is called the first time', function () {
      this.SparkGraphService.setMetricsGraph(this.metricsData.response, null);
      expect(AmCharts.makeChart).toHaveBeenCalled();
      expect(this.chart.validateData).not.toHaveBeenCalled();
    });

    it('should update graph when setMetricsGraph is called a second time', function () {
      let chart = this.SparkGraphService.setMetricsGraph(this.metricsData.response, null);
      this.SparkGraphService.setMetricsGraph(this.metricsData.response, chart);
      expect(this.chart.validateData).toHaveBeenCalled();
    });
  });

  describe('Registered Devices graph services', function () {
    beforeEach(function () {
      this.data = _.cloneDeep(this.devicesJson.response.graphData);
      this.filter = _.cloneDeep(this.devicesJson.response.filterArray);

      this.chart.dataProvider = this.data;
      spyOn(AmCharts, 'makeChart').and.returnValue(this.chart);
    });

    it('should have created a graph when setDeviceGraph is called the first time', function () {
      this.SparkGraphService.setDeviceGraph(this.data, null, this.filter[0]);
      expect(AmCharts.makeChart).toHaveBeenCalled();
      expect(this.chart.validateData).not.toHaveBeenCalled();
    });

    it('should update graph when setDeviceGraph is called a second time', function () {
      let chart = this.SparkGraphService.setDeviceGraph(this.data, null, this.filter[0]);
      this.SparkGraphService.setDeviceGraph(this.data, chart, this.filter[1]);
      expect(this.chart.validateData).toHaveBeenCalled();
    });

    it('should have created a graph when setDeviceLineGraph is called the first time', function () {
      this.SparkGraphService.setDeviceLineGraph(this.data, null, this.filter[0]);
      expect(AmCharts.makeChart).toHaveBeenCalled();
      expect(this.chart.validateData).not.toHaveBeenCalled();
    });

    it('should update graph when setDeviceGraph is called a second time', function () {
      let chart = this.SparkGraphService.setDeviceLineGraph(this.data, null, this.filter[0]);
      this.SparkGraphService.setDeviceLineGraph(this.data, chart, this.filter[1]);
      expect(this.chart.validateData).toHaveBeenCalled();
    });
  });
});
