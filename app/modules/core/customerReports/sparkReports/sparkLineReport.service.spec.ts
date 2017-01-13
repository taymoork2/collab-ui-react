import {
  IEndpointContainer,
  IEndpointData,
  IMetricsData,
} from './sparkReportInterfaces';

describe('Service: Customer Reports Service', function () {
  let activeData = getJSONFixture('core/json/customerReports/activeUser.json');
  let conversationData = getJSONFixture('core/json/customerReports/conversation.json');
  let defaults = getJSONFixture('core/json/partnerReports/commonReportService.json');
  let devicesJson = getJSONFixture('core/json/customerReports/devices.json');
  let mediaData = getJSONFixture('core/json/customerReports/mediaQuality.json');
  let metricsData = getJSONFixture('core/json/customerReports/callMetrics.json');
  let rejectError: any = {
    status: 500,
  };

  let updateDates: any = (data: Array<any>, filter: string | undefined, altDate: string | undefined): Array<any> => {
    _.forEachRight(data, (item: any, index: number): void => {
      if (filter) {
        item.date = moment().tz(defaults.timezone).subtract(data.length - index, defaults.DAY).format(filter);
      } else if (altDate) {
        item[altDate] = moment().tz(defaults.timezone).subtract(data.length - index, defaults.DAY).format();
      } else {
        item.date = moment().tz(defaults.timezone).subtract(data.length - index, defaults.DAY).format();
      }
    });
    return data;
  };

  let dataResponse: any = (data: any): any => {
    return {
      data: {
        data: data,
      },
    };
  };

  afterAll(function () {
    devicesJson = metricsData = mediaData = activeData = conversationData = defaults = rejectError = updateDates = dataResponse = undefined;
  });

  beforeEach(function () {
    this.initModules('Core');
    this.injectDependencies('$scope', '$q', 'CommonReportService', 'SparkLineReportService');

    spyOn(this.CommonReportService, 'returnErrorCheck').and.callFake((error, message, response) => {
      expect(error).toEqual(rejectError);
      expect(message).toEqual(jasmine.any(String));
      return response;
    });
  });

  describe('Active User Services', function () {
    it('should return column data getActiveUserData', function () {
      spyOn(this.CommonReportService, 'getCustomerActiveUserData').and.returnValue(this.$q.when(dataResponse(updateDates(_.cloneDeep(activeData.activeLineData), undefined, undefined))));

      this.SparkLineReportService.getActiveUserData(defaults.timeFilter[0]).then(function (response) {
        expect(response).toEqual({
          graphData: updateDates(_.cloneDeep(activeData.activeLineResponse), defaults.dayFormat, undefined),
          isActiveUsers: true,
        });
      });
      this.$scope.$apply();
    });

    it('should notify an error for getActiveUserData', function () {
      spyOn(this.CommonReportService, 'getCustomerActiveUserData').and.returnValue(this.$q.reject(rejectError));

      this.SparkLineReportService.getActiveUserData(defaults.timeFilter[0]).then(function (response) {
        expect(response).toEqual({
          graphData: [],
          isActiveUsers: false,
        });
      });
      this.$scope.$apply();
    });

    it('should getMostActiveUserData', function () {
      spyOn(this.CommonReportService, 'getCustomerActiveUserData').and.returnValue(this.$q.when({
        data: _.cloneDeep(activeData.mostActive),
      }));

      this.SparkLineReportService.getMostActiveUserData(defaults.timeFilter[0]).then(function (response) {
        expect(response).toEqual(_.cloneDeep(activeData.mostActiveResponse));
      });
      this.$scope.$apply();
    });

    it('should notify an error for getMostActiveUserData', function () {
      spyOn(this.CommonReportService, 'getCustomerActiveUserData').and.returnValue(this.$q.reject(rejectError));

      this.SparkLineReportService.getMostActiveUserData(defaults.timeFilter[0]).then(function (response) {
        expect(response).toEqual([]);
      });
      this.$scope.$apply();
    });
  });

  describe('Conversation Service', function () {
    it('should return column data getConversationData', function () {
      spyOn(this.CommonReportService, 'getCustomerAltReportByType').and.returnValue(this.$q.when(dataResponse(updateDates(_.cloneDeep(conversationData.apiResponse), undefined, undefined))));

      this.SparkLineReportService.getConversationData(defaults.timeFilter[0]).then(function (response) {
        expect(response).toEqual({
          array: updateDates(_.cloneDeep(conversationData.response), defaults.dayFormat, undefined),
          hasRooms: true,
          hasFiles: true,
        });
      });
      this.$scope.$apply();
    });

    it('should notify an error for getConversationData', function () {
      spyOn(this.CommonReportService, 'getCustomerAltReportByType').and.returnValue(this.$q.reject(rejectError));

      this.SparkLineReportService.getConversationData(defaults.timeFilter[0]).then(function (response) {
        expect(response).toEqual({
          array: updateDates(_.cloneDeep(conversationData.emptyResponse), defaults.dayFormat, undefined),
          hasRooms: false,
          hasFiles: false,
        });
      });
      this.$scope.$apply();
    });
  });

  describe('Media Service', function () {
    it('should getMediaQualityData', function () {
      spyOn(this.CommonReportService, 'getCustomerAltReportByType').and.returnValue(this.$q.when(dataResponse(updateDates(_.cloneDeep(mediaData.callQuality.data[0].data), undefined, undefined))));

      this.SparkLineReportService.getMediaQualityData(defaults.timeFilter[0]).then(function (response) {
        expect(response).toEqual(updateDates(_.cloneDeep(mediaData.lineResponse), defaults.dayFormat, undefined));
      });
      this.$scope.$apply();
    });

    it('should notify an error for getMediaQualityData', function () {
      spyOn(this.CommonReportService, 'getCustomerAltReportByType').and.returnValue(this.$q.reject(rejectError));

      this.SparkLineReportService.getMediaQualityData(defaults.timeFilter[0]).then(function (response) {
        expect(response).toEqual([]);
      });
      this.$scope.$apply();
    });
  });

  describe('Metrics Service', function () {
    it('should getMetricsData', function () {
      spyOn(this.CommonReportService, 'getCustomerAltReportByType').and.returnValue(this.$q.when(updateDates({
        data: _.cloneDeep(metricsData.lineData),
      })));

      let lineResponse: Array<IMetricsData> = [];
      for (let i = 0; i < 7; i++) {
        lineResponse.push(_.cloneDeep(metricsData.lineResponse));
      }

      this.SparkLineReportService.getMetricsData(defaults.timeFilter[0]).then(function (response) {
        expect(response).toEqual(lineResponse);
      });
      this.$scope.$apply();
    });

    it('should notify an error for getMetricsData', function () {
      spyOn(this.CommonReportService, 'getCustomerAltReportByType').and.returnValue(this.$q.reject(rejectError));

      this.SparkLineReportService.getMetricsData(defaults.timeFilter[0]).then(function (response) {
        expect(response).toEqual([]);
      });
      this.$scope.$apply();
    });
  });

  describe('Registered Endpoints Service', function () {
    let devicesData: any = _.cloneDeep(devicesJson.deviceData);
    let endpoints: IEndpointContainer = {
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
      let graph: Array<IEndpointData> = [];
      for (let i = 1; i <= 7; i++) {
        let date: string = moment().tz(defaults.timezone).subtract(i, defaults.DAY).format();
        item.details[date] = 5 * i;
        graph.unshift({
          date: moment(date).format(defaults.dayFormat),
          totalRegisteredDevices: 5 * i,
        });

        if (_.isUndefined(endpoints.graphData[0].graph[i - 1])) {
          endpoints.graphData[0].graph.unshift({
            date: moment(date).format(defaults.dayFormat),
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

    it('should getDeviceData', function () {
      spyOn(this.CommonReportService, 'getCustomerAltReportByType').and.returnValue(this.$q.when(dataResponse(devicesData)));

      this.SparkLineReportService.getDeviceData(defaults.timeFilter[0]).then(function (response) {
        expect(response).toEqual(endpoints);
      });
      this.$scope.$apply();
    });

    it('should notify an error for getDeviceData', function () {
      spyOn(this.CommonReportService, 'getCustomerAltReportByType').and.returnValue(this.$q.reject(rejectError));

      this.SparkLineReportService.getDeviceData(defaults.timeFilter[0]).then(function (response) {
        expect(response).toEqual(devicesJson.emptyData);
      });
      this.$scope.$apply();
    });
  });
});
