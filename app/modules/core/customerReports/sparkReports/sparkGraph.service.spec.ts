describe('Service: Customer Graph Service', function () {
  let validateService: any;
  let activeUsers: any = getJSONFixture('core/json/customerReports/activeUser.json');
  let avgRooms: any = getJSONFixture('core/json/customerReports/roomData.json');
  let devicesJson: any = getJSONFixture('core/json/customerReports/devices.json');
  let fileData: any = getJSONFixture('core/json/customerReports/fileData.json');
  let mediaData: any = getJSONFixture('core/json/customerReports/mediaQuality.json');
  let metricsData: any = getJSONFixture('core/json/customerReports/callMetrics.json');

  afterAll(function () {
    activeUsers = avgRooms = devicesJson = fileData = mediaData = metricsData = undefined;
  });

  afterEach(function () {
    validateService = undefined;
  });

  const chart: any = {
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
    validateData: undefined,
  };

  beforeEach(function () {
    this.initModules('Core');
    this.injectDependencies('SparkGraphService');

    validateService = {
      validateData: jasmine.createSpy('validateData'),
    };
  });

  describe('Active Users graph services', function () {
    let data = _.cloneDeep(activeUsers.dummyData.one);
    let filter = _.cloneDeep(activeUsers.dropdownOptions);

    afterAll(function () {
      data = filter = undefined;
    });

    beforeEach(function () {
      let chartResponse: any = _.cloneDeep(chart);
      chartResponse.dataProvider = data;
      chartResponse.validateData = validateService.validateData;
      spyOn(AmCharts, 'makeChart').and.returnValue(chartResponse);
    });

    it('should have created a line graph when setActiveLineGraph is called the first time', function () {
      this.SparkGraphService.setActiveLineGraph(data, null, filter[0]);
      expect(AmCharts.makeChart).toHaveBeenCalled();
      expect(validateService.validateData).not.toHaveBeenCalled();
    });

    it('should update graph when setActiveLineGraph is called a second time', function () {
      let chart = this.SparkGraphService.setActiveLineGraph(data, null, filter[0]);
      this.SparkGraphService.setActiveLineGraph(data, chart, filter[1]);
      expect(validateService.validateData).toHaveBeenCalled();
    });

    it('should have created a graph when setActiveUsersGraph is called the first time', function () {
      this.SparkGraphService.setActiveUsersGraph(data, null);
      expect(AmCharts.makeChart).toHaveBeenCalled();
      expect(validateService.validateData).not.toHaveBeenCalled();
    });

    it('should update graph when setActiveUsersGraph is called a second time', function () {
      let chart = this.SparkGraphService.setActiveUsersGraph(data, null);
      this.SparkGraphService.setActiveUsersGraph(data, chart);
      expect(validateService.validateData).toHaveBeenCalled();
    });
  });

  describe('Total Rooms graph services', function () {
    let data = _.cloneDeep(avgRooms.response);

    afterAll(function () {
      data = undefined;
    });

    beforeEach(function () {
      let chartResponse: any = _.cloneDeep(chart);
      chartResponse.dataProvider = data;
      chartResponse.validateData = validateService.validateData;
      spyOn(AmCharts, 'makeChart').and.returnValue(chartResponse);
    });

    it('should have created a graph when setAvgRoomsGraph is called the first time', function () {
      this.SparkGraphService.setAvgRoomsGraph(data, null);
      expect(AmCharts.makeChart).toHaveBeenCalled();
      expect(validateService.validateData).not.toHaveBeenCalled();
    });

    it('should update graph when setAvgRoomsGraph is called a second time', function () {
      let chart = this.SparkGraphService.setAvgRoomsGraph(data, null);
      this.SparkGraphService.setAvgRoomsGraph(data, chart);
      expect(validateService.validateData).toHaveBeenCalled();
    });

    it('should have created a graph when setRoomGraph is called the first time', function () {
      this.SparkGraphService.setRoomGraph(data, null);
      expect(AmCharts.makeChart).toHaveBeenCalled();
      expect(validateService.validateData).not.toHaveBeenCalled();
    });

    it('should update graph when setRoomGraph is called a second time', function () {
      let chart = this.SparkGraphService.setRoomGraph(data, null);
      this.SparkGraphService.setRoomGraph(data, chart);
      expect(validateService.validateData).toHaveBeenCalled();
    });
  });

  describe('Files Shared graph services', function () {
    let data = _.cloneDeep(fileData.response);

    afterAll(function () {
      data = undefined;
    });

    beforeEach(function () {
      let chartResponse: any = _.cloneDeep(chart);
      chartResponse.dataProvider = data;
      chartResponse.validateData = validateService.validateData;
      spyOn(AmCharts, 'makeChart').and.returnValue(chartResponse);
    });

    it('should have created a graph when setFilesSharedGraph is called the first time', function () {
      this.SparkGraphService.setFilesSharedGraph(data, null);
      expect(AmCharts.makeChart).toHaveBeenCalled();
      expect(validateService.validateData).not.toHaveBeenCalled();
    });

    it('should update graph when setFilesSharedGraph is called a second time', function () {
      let chart = this.SparkGraphService.setFilesSharedGraph(data, null);
      this.SparkGraphService.setFilesSharedGraph(data, chart);
      expect(validateService.validateData).toHaveBeenCalled();
    });

    it('should have created a graph when setFilesGraph is called the first time', function () {
      this.SparkGraphService.setFilesGraph(data, null);
      expect(AmCharts.makeChart).toHaveBeenCalled();
      expect(validateService.validateData).not.toHaveBeenCalled();
    });

    it('should update graph when setFilesGraph is called a second time', function () {
      let chart = this.SparkGraphService.setFilesGraph(data, null);
      this.SparkGraphService.setFilesGraph(data, chart);
      expect(validateService.validateData).toHaveBeenCalled();
    });
  });

  describe('Media Quality graph services', function () {
    let data = _.cloneDeep(mediaData.response);
    let filter = _.cloneDeep(mediaData.dropdownFilter);

    afterAll(function () {
      data = filter = undefined;
    });

    beforeEach(function () {
      let chartResponse: any = _.cloneDeep(chart);
      chartResponse.dataProvider = data;
      chartResponse.validateData = validateService.validateData;
      spyOn(AmCharts, 'makeChart').and.returnValue(chartResponse);
    });

    it('should have created a graph when setMediaQualityGraph is called the first time', function () {
      this.SparkGraphService.setMediaQualityGraph(data, null, filter[0]);
      expect(AmCharts.makeChart).toHaveBeenCalled();
      expect(validateService.validateData).not.toHaveBeenCalled();
    });

    it('should update graph when setMediaQualityGraph is called a second time', function () {
      let chart = this.SparkGraphService.setMediaQualityGraph(data, null, filter[0]);
      this.SparkGraphService.setMediaQualityGraph(data, chart, filter[1]);
      expect(validateService.validateData).toHaveBeenCalled();
    });

    it('should have created a graph when setQualityGraph is called the first time', function () {
      this.SparkGraphService.setQualityGraph(data, null, filter[0]);
      expect(AmCharts.makeChart).toHaveBeenCalled();
      expect(validateService.validateData).not.toHaveBeenCalled();
    });

    it('should update graph when setQualityGraph is called a second time', function () {
      let chart = this.SparkGraphService.setQualityGraph(data, null, filter[0]);
      this.SparkGraphService.setQualityGraph(data, chart, filter[1]);
      expect(validateService.validateData).toHaveBeenCalled();
    });
  });

  describe('Call Metrics graph services', function () {
    beforeEach(function () {
      spyOn(AmCharts, 'makeChart').and.returnValue({
        dataProvider: metricsData.response,
        validateData: validateService.validateData,
      });
    });

    it('should have created a graph when setMetricsGraph is called the first time', function () {
      this.SparkGraphService.setMetricsGraph(metricsData.response, null);
      expect(AmCharts.makeChart).toHaveBeenCalled();
      expect(validateService.validateData).not.toHaveBeenCalled();
    });

    it('should update graph when setMetricsGraph is called a second time', function () {
      let chart = this.SparkGraphService.setMetricsGraph(metricsData.response, null);
      this.SparkGraphService.setMetricsGraph(metricsData.response, chart);
      expect(validateService.validateData).toHaveBeenCalled();
    });
  });

  describe('Registered Devices graph services', function () {
    let data = _.cloneDeep(devicesJson.response.graphData);
    let filter = _.cloneDeep(devicesJson.response.filterArray);

    afterAll(function () {
      data = filter = undefined;
    });

    beforeEach(function () {
      let chartResponse: any = _.cloneDeep(chart);
      chartResponse.dataProvider = data;
      chartResponse.validateData = validateService.validateData;
      spyOn(AmCharts, 'makeChart').and.returnValue(chartResponse);
    });

    it('should have created a graph when setDeviceGraph is called the first time', function () {
      this.SparkGraphService.setDeviceGraph(data, null, filter[0]);
      expect(AmCharts.makeChart).toHaveBeenCalled();
      expect(validateService.validateData).not.toHaveBeenCalled();
    });

    it('should update graph when setDeviceGraph is called a second time', function () {
      let chart = this.SparkGraphService.setDeviceGraph(data, null, filter[0]);
      this.SparkGraphService.setDeviceGraph(data, chart, filter[1]);
      expect(validateService.validateData).toHaveBeenCalled();
    });

    it('should have created a graph when setDeviceLineGraph is called the first time', function () {
      this.SparkGraphService.setDeviceLineGraph(data, null, filter[0]);
      expect(AmCharts.makeChart).toHaveBeenCalled();
      expect(validateService.validateData).not.toHaveBeenCalled();
    });

    it('should update graph when setDeviceGraph is called a second time', function () {
      let chart = this.SparkGraphService.setDeviceLineGraph(data, null, filter[0]);
      this.SparkGraphService.setDeviceLineGraph(data, chart, filter[1]);
      expect(validateService.validateData).toHaveBeenCalled();
    });
  });
});
