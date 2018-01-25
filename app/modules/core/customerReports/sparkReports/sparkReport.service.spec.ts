import sparkReports from './index';
import {
  IActiveTableBase,
  ICustomerIntervalQuery,
} from '../../partnerReports/partnerReportInterfaces';
import {
  IActiveUserWrapper,
  IAvgRoomData,
  IEndpointContainer,
  IEndpointWrapper,
  IFilesShared,
  IMediaData,
  IMetricsData,
} from './sparkReportInterfaces';

describe('Service: Customer Reports Service', function () {
  beforeEach(function () {
    this.initModules(sparkReports);
    this.injectDependencies('$scope', '$q', 'CommonReportService', 'SparkReportService');

    this.activeData = getJSONFixture('core/json/customerReports/activeUser.json');
    this.defaults = getJSONFixture('core/json/partnerReports/commonReportService.json');
    this.devicesJson = getJSONFixture('core/json/customerReports/devices.json');
    this.fileData = getJSONFixture('core/json/customerReports/fileData.json');
    this.mediaData = getJSONFixture('core/json/customerReports/mediaQuality.json');
    this.metricsData = getJSONFixture('core/json/customerReports/callMetrics.json');
    this.roomData = getJSONFixture('core/json/customerReports/roomData.json');

    this.rejectError = {
      status: 500,
    };

    this.updateDates = (data: any[], filter?: string, altDate?: string): any[] => {
      _.forEachRight(data, (item: any, index: number): void => {
        if (filter) {
          item.date = moment().tz(this.defaults.timezone).subtract(data.length - index, this.defaults.DAY).format(filter);
        } else if (altDate) {
          item[altDate] = moment().tz(this.defaults.timezone).subtract(data.length - index, this.defaults.DAY).format();
        } else {
          item.date = moment().tz(this.defaults.timezone).subtract(data.length - index, this.defaults.DAY).format();
        }
      });
      return data;
    };

    this.dataResponse = (data: any): any => {
      return { data: { data: data } };
    };

    spyOn(this.CommonReportService, 'returnErrorCheck').and.callFake((_error, _message, response: any): any => {
      return response;
    });
  });

  describe('Active User Services', function () {
    it('should return column data getActiveUserData', function () {
      spyOn(this.CommonReportService, 'getCustomerReport').and.returnValue(this.$q.resolve(this.dataResponse([{
        data: this.updateDates(_.cloneDeep(this.activeData.activeDetailed)),
      }])));

      this.SparkReportService.getActiveUserData(this.defaults.timeFilter[0]).then((response: IActiveUserWrapper): void => {
        expect(response).toEqual({
          graphData: this.updateDates(_.cloneDeep(this.activeData.activeResponse), this.defaults.dayFormat),
          isActiveUsers: true,
        });
      });
      this.$scope.$apply();
    });

    it('should notify an error for getActiveUserData', function () {
      spyOn(this.CommonReportService, 'getCustomerReport').and.returnValue(this.$q.reject(this.rejectError));

      this.SparkReportService.getActiveUserData(this.defaults.timeFilter[0]).then((response: IActiveUserWrapper): void => {
        expect(response).toEqual({
          graphData: [],
          isActiveUsers: false,
        });
      });
      this.$scope.$apply();
    });

    it('should getMostActiveUserData', function () {
      spyOn(this.CommonReportService, 'getCustomerActiveUserData').and.returnValue(this.$q.resolve({
        data: _.cloneDeep(this.activeData.mostActive),
      }));

      this.SparkReportService.getMostActiveUserData(this.defaults.timeFilter[0]).then((response: IActiveTableBase[]): void => {
        expect(response).toEqual(_.cloneDeep(this.activeData.mostActiveResponse));
      });
      this.$scope.$apply();
    });

    it('should notify an error for getMostActiveUserData', function () {
      spyOn(this.CommonReportService, 'getCustomerActiveUserData').and.returnValue(this.$q.reject(this.rejectError));

      this.SparkReportService.getMostActiveUserData(this.defaults.timeFilter[0]).catch((response: IActiveTableBase[]): void => {
        expect(response).toEqual([]);
      });
      this.$scope.$apply();
    });
  });

  describe('Rooms Service', function () {
    it('should getAvgRoomData', function () {
      const q: any = this.$q;
      spyOn(this.CommonReportService, 'getCustomerReport').and.callFake((options: ICustomerIntervalQuery): ng.IPromise<any> => {
        let data = this.updateDates(_.cloneDeep(this.roomData.groupRooms.data));
        if (options.type === 'convOneOnOne') {
          data = this.updateDates(_.cloneDeep(this.roomData.oneTwoOneRooms.data));
        } else if (options.type === 'avgConversations') {
          data = this.updateDates(_.cloneDeep(this.roomData.avgRooms.data));
        }
        return q.resolve(this.dataResponse(data));
      });

      this.SparkReportService.getAvgRoomData(this.defaults.timeFilter[0]).then((response: IAvgRoomData[]): void => {
        expect(response).toEqual(this.updateDates(_.cloneDeep(this.roomData.response), this.defaults.dayFormat));
      });
      this.$scope.$apply();
    });

    it('should notify an error for getAvgRoomData', function () {
      spyOn(this.CommonReportService, 'getCustomerReport').and.returnValue(this.$q.reject(this.rejectError));

      this.SparkReportService.getAvgRoomData(this.defaults.timeFilter[0]).then((response: IAvgRoomData[]): void => {
        expect(response).toEqual([]);
      });
      this.$scope.$apply();
    });
  });

  describe('File Service', function () {
    it('should getFilesSharedData', function () {
      const q: any = this.$q;
      spyOn(this.CommonReportService, 'getCustomerReport').and.callFake((options) => {
        let data = this.updateDates(_.cloneDeep(this.fileData.content.data));
        if (options.type === 'contentShareSizes') {
          data = this.updateDates(_.cloneDeep(this.fileData.contentSize.data));
        }
        return q.resolve(this.dataResponse(data));
      });

      this.SparkReportService.getFilesSharedData(this.defaults.timeFilter[0]).then((response: IFilesShared[]): void => {
        expect(response).toEqual(this.updateDates(_.cloneDeep(this.fileData.response), this.defaults.dayFormat));
      });
      this.$scope.$apply();
    });

    it('should notify an error for getFilesSharedData', function () {
      spyOn(this.CommonReportService, 'getCustomerReport').and.returnValue(this.$q.reject(this.rejectError));

      this.SparkReportService.getFilesSharedData(this.defaults.timeFilter[0]).then((response: IFilesShared[]): void => {
        expect(response).toEqual([]);
      });
      this.$scope.$apply();
    });
  });

  describe('Media Service', function () {
    it('should getMediaQualityData', function () {
      spyOn(this.CommonReportService, 'getCustomerReport').and.returnValue(this.$q.resolve(this.dataResponse([{
        data: this.updateDates(_.cloneDeep(this.mediaData.callQuality.data[0].data)),
      }])));

      this.SparkReportService.getMediaQualityData(this.defaults.timeFilter[0]).then((response: IMediaData[]): void => {
        expect(response).toEqual(this.updateDates(_.cloneDeep(this.mediaData.response), this.defaults.dayFormat));
      });
      this.$scope.$apply();
    });

    it('should notify an error for getMediaQualityData', function () {
      spyOn(this.CommonReportService, 'getCustomerReport').and.returnValue(this.$q.reject(this.rejectError));

      this.SparkReportService.getMediaQualityData(this.defaults.timeFilter[0]).then((response: IMediaData[]): void => {
        expect(response).toEqual([]);
      });
      this.$scope.$apply();
    });
  });

  describe('Call Metrics Service', function () {
    it('should getCallMetricsData', function () {
      spyOn(this.CommonReportService, 'getCustomerReport').and.returnValue(this.$q.resolve(this.dataResponse(_.cloneDeep(this.metricsData.data))));

      this.SparkReportService.getCallMetricsData(this.defaults.timeFilter[0]).then((response: IMetricsData): void => {
        expect(response).toEqual(this.metricsData.response);
      });
      this.$scope.$apply();
    });

    it('should notify an error for getCallMetricsData', function () {
      spyOn(this.CommonReportService, 'getCustomerReport').and.returnValue(this.$q.reject(this.rejectError));

      this.SparkReportService.getCallMetricsData(this.defaults.timeFilter[0]).then((response: IMetricsData): void => {
        expect(response.dataProvider).toEqual(this.metricsData.emptyData);
      });
      this.$scope.$apply();
    });
  });

  describe('Registered Endpoints Service', function () {
    it('should getDeviceData', function () {
      const devicesData: any[] = _.cloneDeep(this.devicesJson.deviceData);
      _.forEach(devicesData, (item: any): void => {
        item.details = this.updateDates(item.details, undefined, 'recordTime');
      });

      const deviceResponse: IEndpointContainer = _.cloneDeep(this.devicesJson.response);
      _.forEach(deviceResponse.graphData, (item: IEndpointWrapper): void => {
        item.graph = this.updateDates(item.graph, this.defaults.dayFormat);
      });

      spyOn(this.CommonReportService, 'getCustomerReportByType').and.returnValue(this.$q.resolve(this.dataResponse(devicesData)));

      this.SparkReportService.getDeviceData(this.defaults.timeFilter[0]).then((response: IEndpointContainer): void => {
        expect(response).toEqual(deviceResponse);
      });
      this.$scope.$apply();
    });

    it('should notify an error for getDeviceData', function () {
      spyOn(this.CommonReportService, 'getCustomerReportByType').and.returnValue(this.$q.reject(this.rejectError));

      this.SparkReportService.getDeviceData(this.defaults.timeFilter[0]).then((response: IEndpointContainer): void => {
        expect(response).toEqual(this.devicesJson.emptyData);
      });
      this.$scope.$apply();
    });
  });
});
