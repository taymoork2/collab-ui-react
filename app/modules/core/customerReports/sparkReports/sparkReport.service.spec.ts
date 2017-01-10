describe('Service: Customer Reports Service', function () {
  let activeData = getJSONFixture('core/json/customerReports/activeUser.json');
  let defaults = getJSONFixture('core/json/partnerReports/commonReportService.json');
  let devicesJson = getJSONFixture('core/json/customerReports/devices.json');
  let fileData = getJSONFixture('core/json/customerReports/fileData.json');
  let mediaData = getJSONFixture('core/json/customerReports/mediaQuality.json');
  let metricsData = getJSONFixture('core/json/customerReports/callMetrics.json');
  let roomData = getJSONFixture('core/json/customerReports/roomData.json');
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
    activeData = defaults = devicesJson = fileData = mediaData = metricsData = roomData = rejectError = updateDates = dataResponse = undefined;
  });

  beforeEach(function () {
    this.initModules('Core');
    this.injectDependencies('$scope', '$q', 'CommonReportService', 'SparkReportService');

    spyOn(this.CommonReportService, 'returnErrorCheck').and.callFake((error, message, response) => {
      expect(error).toEqual(rejectError);
      expect(message).toEqual(jasmine.any(String));
      return response;
    });
  });

  describe('Active User Services', function () {
    it('should return column data getActiveUserData', function () {
      spyOn(this.CommonReportService, 'getCustomerReport').and.returnValue(this.$q.when(dataResponse([{
        data: updateDates(_.cloneDeep(activeData.activeDetailed), undefined, undefined),
      }])));

      this.SparkReportService.getActiveUserData(defaults.timeFilter[0]).then(function (response) {
        expect(response).toEqual({
          graphData: updateDates(_.cloneDeep(activeData.activeResponse), defaults.dayFormat, undefined),
          isActiveUsers: true,
        });
      });
      this.$scope.$apply();
    });

    it('should notify an error for getActiveUserData', function () {
      spyOn(this.CommonReportService, 'getCustomerReport').and.returnValue(this.$q.reject(rejectError));

      this.SparkReportService.getActiveUserData(defaults.timeFilter[0]).then(function (response) {
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

      this.SparkReportService.getMostActiveUserData(defaults.timeFilter[0]).then(function (response) {
        expect(response).toEqual(_.cloneDeep(activeData.mostActiveResponse));
      });
      this.$scope.$apply();
    });

    it('should notify an error for getMostActiveUserData', function () {
      spyOn(this.CommonReportService, 'getCustomerActiveUserData').and.returnValue(this.$q.reject(rejectError));

      this.SparkReportService.getMostActiveUserData(defaults.timeFilter[0]).then(function (response) {
        expect(response).toEqual([]);
      });
      this.$scope.$apply();
    });
  });

  describe('Rooms Service', function () {
    it('should getAvgRoomData', function () {
      let q: any = this.$q;
      spyOn(this.CommonReportService, 'getCustomerReport').and.callFake(function (options) {
        let data = updateDates(_.cloneDeep(roomData.groupRooms.data), undefined, undefined);
        if (options.type === 'convOneOnOne') {
          data = updateDates(_.cloneDeep(roomData.oneTwoOneRooms.data), undefined, undefined);
        } else if (options.type === 'avgConversations') {
          data = updateDates(_.cloneDeep(roomData.avgRooms.data), undefined, undefined);
        }
        return q.when(dataResponse(data));
      });

      this.SparkReportService.getAvgRoomData(defaults.timeFilter[0]).then(function (response) {
        expect(response).toEqual(updateDates(_.cloneDeep(roomData.response), defaults.dayFormat, undefined));
      });
      this.$scope.$apply();
    });

    it('should notify an error for getAvgRoomData', function () {
      spyOn(this.CommonReportService, 'getCustomerReport').and.returnValue(this.$q.reject(rejectError));

      this.SparkReportService.getAvgRoomData(defaults.timeFilter[0]).then(function (response) {
        expect(response).toEqual([]);
      });
      this.$scope.$apply();
    });
  });

  describe('File Service', function () {
    it('should getFilesSharedData', function () {
      let q: any = this.$q;
      spyOn(this.CommonReportService, 'getCustomerReport').and.callFake((options) => {
        let data = updateDates(_.cloneDeep(fileData.content.data), undefined, undefined);
        if (options.type === 'contentShareSizes') {
          data = updateDates(_.cloneDeep(fileData.contentSize.data), undefined, undefined);
        }
        return q.when(dataResponse(data));
      });

      this.SparkReportService.getFilesSharedData(defaults.timeFilter[0]).then(function (response) {
        expect(response).toEqual(updateDates(_.cloneDeep(fileData.response), defaults.dayFormat, undefined));
      });
      this.$scope.$apply();
    });

    it('should notify an error for getFilesSharedData', function () {
      spyOn(this.CommonReportService, 'getCustomerReport').and.returnValue(this.$q.reject(rejectError));

      this.SparkReportService.getFilesSharedData(defaults.timeFilter[0]).then(function (response) {
        expect(response).toEqual([]);
      });
      this.$scope.$apply();
    });
  });

  describe('Media Service', function () {
    it('should getMediaQualityData', function () {
      spyOn(this.CommonReportService, 'getCustomerReport').and.returnValue(this.$q.when(dataResponse([{
        data: updateDates(_.cloneDeep(mediaData.callQuality.data[0].data), undefined, undefined),
      }])));

      this.SparkReportService.getMediaQualityData(defaults.timeFilter[0]).then(function (response) {
        expect(response).toEqual(updateDates(_.cloneDeep(mediaData.response), defaults.dayFormat, undefined));
      });
      this.$scope.$apply();
    });

    it('should notify an error for getMediaQualityData', function () {
      spyOn(this.CommonReportService, 'getCustomerReport').and.returnValue(this.$q.reject(rejectError));

      this.SparkReportService.getMediaQualityData(defaults.timeFilter[0]).then(function (response) {
        expect(response).toEqual([]);
      });
      this.$scope.$apply();
    });
  });

  describe('Call Metrics Service', function () {
    it('should getCallMetricsData', function () {
      spyOn(this.CommonReportService, 'getCustomerReport').and.returnValue(this.$q.when(dataResponse(_.cloneDeep(metricsData.data))));

      this.SparkReportService.getCallMetricsData(defaults.timeFilter[0]).then(function (response) {
        expect(response).toEqual(metricsData.response);
      });
      this.$scope.$apply();
    });

    it('should notify an error for getCallMetricsData', function () {
      spyOn(this.CommonReportService, 'getCustomerReport').and.returnValue(this.$q.reject(rejectError));

      this.SparkReportService.getCallMetricsData(defaults.timeFilter[0]).then(function (response) {
        expect(response.dataProvider).toEqual(metricsData.emptyData);
      });
      this.$scope.$apply();
    });
  });

  describe('Registered Endpoints Service', function () {
    let devicesData = _.cloneDeep(devicesJson.deviceData);
    _.forEach(devicesData, function (item) {
      item.details = updateDates(item.details, undefined, 'recordTime');
    });

    let deviceResponse = _.cloneDeep(devicesJson.response);
    _.forEach(deviceResponse.graphData, function (item) {
      item.graph = updateDates(item.graph, defaults.dayFormat, undefined);
    });

    it('should getDeviceData', function () {
      spyOn(this.CommonReportService, 'getCustomerReportByType').and.returnValue(this.$q.when(dataResponse(devicesData)));

      this.SparkReportService.getDeviceData(defaults.timeFilter[0]).then(function (response) {
        expect(response).toEqual(deviceResponse);
      });
      this.$scope.$apply();
    });

    it('should notify an error for getDeviceData', function () {
      spyOn(this.CommonReportService, 'getCustomerReportByType').and.returnValue(this.$q.reject(rejectError));

      this.SparkReportService.getDeviceData(defaults.timeFilter[0]).then(function (response) {
        expect(response).toEqual(devicesJson.emptyData);
      });
      this.$scope.$apply();
    });
  });
});
