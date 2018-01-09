import sparkReports from './index';
import {
  IActiveUserWrapper,
  IConversationWrapper,
  IEndpointData,
  IEndpointContainer,
  IMediaData,
  IMetricsData,
} from './sparkReportInterfaces';
import { IActiveTableBase } from '../../partnerReports/partnerReportInterfaces';

describe('Service: Customer Reports Service', function () {
  beforeEach(function () {
    this.initModules(sparkReports);
    this.injectDependencies('$scope', '$q', 'CommonReportService', 'SparkLineReportService');

    this.activeData = getJSONFixture('core/json/customerReports/activeUser.json');
    this.conversationData = getJSONFixture('core/json/customerReports/conversation.json');
    this.defaults = getJSONFixture('core/json/partnerReports/commonReportService.json');
    this.devicesJson = getJSONFixture('core/json/customerReports/devices.json');
    this.mediaData = getJSONFixture('core/json/customerReports/mediaQuality.json');
    this.metricsData = getJSONFixture('core/json/customerReports/callMetrics.json');

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

    spyOn(this.CommonReportService, 'returnErrorCheck').and.callFake((_error, _message, response) => {
      return response;
    });
  });

  describe('Active User Services', function () {
    it('should return column data getActiveUserData', function () {
      spyOn(this.CommonReportService, 'getCustomerActiveUserData').and.returnValue(this.$q.resolve(this.dataResponse(this.updateDates(_.cloneDeep(this.activeData.activeLineData)))));

      this.SparkLineReportService.getActiveUserData(this.defaults.timeFilter[0]).then((response: IActiveUserWrapper): void => {
        expect(response).toEqual({
          graphData: this.updateDates(_.cloneDeep(this.activeData.activeLineResponse), this.defaults.dayFormat),
          isActiveUsers: true,
        });
      });
      this.$scope.$apply();
    });

    it('should notify an error for getActiveUserData', function () {
      spyOn(this.CommonReportService, 'getCustomerActiveUserData').and.returnValue(this.$q.reject(this.rejectError));

      this.SparkLineReportService.getActiveUserData(this.defaults.timeFilter[0]).then((response: IActiveUserWrapper): void => {
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

      this.SparkLineReportService.getMostActiveUserData(this.defaults.timeFilter[0]).then((response: IActiveTableBase[]): void => {
        expect(response).toEqual(_.cloneDeep(this.activeData.mostActiveResponse));
      });
      this.$scope.$apply();
    });

    it('should notify an error for getMostActiveUserData', function () {
      spyOn(this.CommonReportService, 'getCustomerActiveUserData').and.returnValue(this.$q.reject(this.rejectError));

      this.SparkLineReportService.getMostActiveUserData(this.defaults.timeFilter[0]).catch((response: IActiveTableBase[]): void => {
        expect(response).toEqual([]);
      });
      this.$scope.$apply();
    });
  });

  describe('Conversation Service', function () {
    it('should return column data getConversationData', function () {
      spyOn(this.CommonReportService, 'getCustomerAltReportByType').and.returnValue(this.$q.resolve(this.dataResponse(this.updateDates(_.cloneDeep(this.conversationData.apiResponse)))));

      this.SparkLineReportService.getConversationData(this.defaults.timeFilter[0]).then((response: IConversationWrapper): void => {
        expect(response).toEqual({
          array: this.updateDates(_.cloneDeep(this.conversationData.response), this.defaults.dayFormat),
          hasRooms: true,
          hasFiles: true,
        });
      });
      this.$scope.$apply();
    });

    it('should notify an error for getConversationData', function () {
      spyOn(this.CommonReportService, 'getCustomerAltReportByType').and.returnValue(this.$q.reject(this.rejectError));

      this.SparkLineReportService.getConversationData(this.defaults.timeFilter[0]).then((response: IConversationWrapper): void => {
        expect(response).toEqual({
          array: this.updateDates(_.cloneDeep(this.conversationData.emptyResponse), this.defaults.dayFormat),
          hasRooms: false,
          hasFiles: false,
        });
      });
      this.$scope.$apply();
    });
  });

  describe('Media Service', function () {
    it('should getMediaQualityData', function () {
      spyOn(this.CommonReportService, 'getCustomerAltReportByType').and.returnValue(this.$q.resolve(this.dataResponse(this.updateDates(_.cloneDeep(this.mediaData.callQuality.data[0].data)))));

      this.SparkLineReportService.getMediaQualityData(this.defaults.timeFilter[0]).then((response: IMediaData[]): void => {
        expect(response).toEqual(this.updateDates(_.cloneDeep(this.mediaData.lineResponse), this.defaults.dayFormat));
      });
      this.$scope.$apply();
    });

    it('should notify an error for getMediaQualityData', function () {
      spyOn(this.CommonReportService, 'getCustomerAltReportByType').and.returnValue(this.$q.reject(this.rejectError));

      this.SparkLineReportService.getMediaQualityData(this.defaults.timeFilter[0]).then((response: IMediaData[]): void => {
        expect(response).toEqual([]);
      });
      this.$scope.$apply();
    });
  });

  describe('Metrics Service', function () {
    it('should getMetricsData', function () {
      spyOn(this.CommonReportService, 'getCustomerAltReportByType').and.returnValue(this.$q.resolve(this.updateDates({
        data: _.cloneDeep(this.metricsData.lineData),
      })));

      const lineResponse: IMetricsData[] = [];
      for (let i = 0; i < 7; i++) {
        lineResponse.push(_.cloneDeep(this.metricsData.lineResponse));
      }

      this.SparkLineReportService.getMetricsData(this.defaults.timeFilter[0]).then((response: IMetricsData[]): void => {
        expect(response).toEqual(lineResponse);
      });
      this.$scope.$apply();
    });

    it('should notify an error for getMetricsData', function () {
      spyOn(this.CommonReportService, 'getCustomerAltReportByType').and.returnValue(this.$q.reject(this.rejectError));

      this.SparkLineReportService.getMetricsData(this.defaults.timeFilter[0]).catch((response: IMetricsData[]): void => {
        expect(response).toEqual([]);
      });
      this.$scope.$apply();
    });
  });

  describe('Registered Endpoints Service', function () {
    it('should getDeviceData', function () {
      const devicesData = _.cloneDeep(this.devicesJson.deviceData);
      const endpoints: IEndpointContainer = {
        graphData: [{
          deviceType: 'registeredEndpoints.allDevices',
          graph: [],
          balloon: true,
          emptyGraph: false,
        }],
        filterArray: [{
          value: 0,
          label: 'registeredEndpoints.allDevices',
        }],
      };

      _.forEach(devicesData, (item: any, index: number): void => {
        item.details = {};
        const graph: IEndpointData[] = [];
        for (let i = 1; i <= 7; i++) {
          const date: string = moment().tz(this.defaults.timezone).subtract(i, this.defaults.DAY).format();
          item.details[date] = 5 * i;
          graph.unshift({
            date: moment(date).format(this.defaults.dayFormat),
            totalRegisteredDevices: 5 * i,
          });

          if (_.isUndefined(endpoints.graphData[0].graph[i - 1])) {
            endpoints.graphData[0].graph.unshift({
              date: moment(date).format(this.defaults.dayFormat),
              totalRegisteredDevices: 5 * devicesData.length * i,
            });
          }
        }

        endpoints.filterArray.push({
          value: index + 1,
          label: item.deviceType,
        });
        endpoints.graphData.push({
          deviceType: item.deviceType,
          graph: graph,
          balloon: true,
          emptyGraph: false,
        });
      });

      spyOn(this.CommonReportService, 'getCustomerAltReportByType').and.returnValue(this.$q.resolve(this.dataResponse(devicesData)));

      this.SparkLineReportService.getDeviceData(this.defaults.timeFilter[0]).then((response: IEndpointContainer): void => {
        expect(response).toEqual(endpoints);
      });
      this.$scope.$apply();
    });

    it('should notify an error for getDeviceData', function () {
      spyOn(this.CommonReportService, 'getCustomerAltReportByType').and.returnValue(this.$q.reject(this.rejectError));

      this.SparkLineReportService.getDeviceData(this.defaults.timeFilter[0]).then((response: IEndpointContainer): void => {
        expect(response).toEqual(this.devicesJson.emptyData);
      });
      this.$scope.$apply();
    });
  });
});
