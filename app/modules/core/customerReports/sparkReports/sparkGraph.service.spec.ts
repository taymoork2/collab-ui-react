import {
  IActiveUserData,
  IDropdownBase,
} from '../../partnerReports/partnerReportInterfaces';

import {
  IAvgRoomData,
  IEndpointWrapper,
  IFilesShared,
  IMediaData,
} from './sparkReportInterfaces';

describe('Service: Customer Graph Service', function () {
  let validateService: any;
  const activeUsers: any = getJSONFixture('core/json/customerReports/activeUser.json');
  const avgRooms: any = getJSONFixture('core/json/customerReports/roomData.json');
  const devicesJson: any = getJSONFixture('core/json/customerReports/devices.json');
  const fileData: any = getJSONFixture('core/json/customerReports/fileData.json');
  const mediaData: any = getJSONFixture('core/json/customerReports/mediaQuality.json');
  const metricsData: any = getJSONFixture('core/json/customerReports/callMetrics.json');

  beforeEach(function () {
    this.initModules('Core');
    this.injectDependencies('SparkGraphService');

    validateService = {
      validateData: jasmine.createSpy('validateData'),
      validateNow: jasmine.createSpy('validateNow'),
    };
  });

  describe('Active Users graph services', function () {
    const data: Array<IActiveUserData> = _.cloneDeep(activeUsers.dummyData.one);
    const filter: Array<IDropdownBase> = _.cloneDeep(activeUsers.dropdownOptions);

    beforeEach(function () {
      spyOn(AmCharts, 'makeChart').and.returnValue({
        categoryAxis: {
          gridColor: 'color',
        },
        chartCursor: {
          valueLineEnabled: true,
        },
        graphs: [],
        dataProvider: data,
        validateData: validateService.validateData,
        validateNow: validateService.validateNow,
      });
    });

    it('should have created a line graph when setActiveLineGraph is called the first time', function () {
      this.SparkGraphService.setActiveLineGraph(data, null, filter[0]);
      expect(AmCharts.makeChart).toHaveBeenCalled();
      expect(validateService.validateData).not.toHaveBeenCalled();
      expect(validateService.validateNow).not.toHaveBeenCalled();
    });

    it('should update graph when setActiveLineGraph is called a second time', function () {
      let chart = this.SparkGraphService.setActiveLineGraph(data, null, filter[0]);
      this.SparkGraphService.setActiveLineGraph(data, chart, filter[1]);
      expect(validateService.validateData).toHaveBeenCalled();
      expect(validateService.validateNow).toHaveBeenCalled();
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
    const data: Array<IAvgRoomData> = _.cloneDeep(avgRooms.response);

    beforeEach(function () {
      spyOn(AmCharts, 'makeChart').and.returnValue({
        dataProvider: data,
        validateData: validateService.validateData,
      });
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
  });

  describe('Files Shared graph services', function () {
    const data: Array<IFilesShared> = _.cloneDeep(fileData.response);

    beforeEach(function () {
      spyOn(AmCharts, 'makeChart').and.returnValue({
        dataProvider: data,
        validateData: validateService.validateData,
      });
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
  });

  describe('Media Quality graph services', function () {
    const data: Array<IMediaData> = _.cloneDeep(mediaData.response);
    const filter: Array<IDropdownBase> = _.cloneDeep(mediaData.dropdownFilter);

    beforeEach(function () {
      spyOn(AmCharts, 'makeChart').and.returnValue({
        dataProvider: data,
        validateData: validateService.validateData,
      });
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
    const data: Array<IEndpointWrapper> = _.cloneDeep(devicesJson.response.graphData);
    const filter: Array<IDropdownBase> = _.cloneDeep(devicesJson.response.filterArray);

    beforeEach(function () {
      spyOn(AmCharts, 'makeChart').and.returnValue({
        dataProvider: data,
        validateData: validateService.validateData,
      });
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
  });
});
