describe('Service: Customer Reports Service', function () {
  const activeData = getJSONFixture('core/json/customerReports/activeUser.json');
  const defaults = getJSONFixture('core/json/partnerReports/commonReportService.json');
  const devicesJson = getJSONFixture('core/json/customerReports/devices.json');
  const fileData = getJSONFixture('core/json/customerReports/fileData.json');
  const mediaData = getJSONFixture('core/json/customerReports/mediaQuality.json');
  const metricsData = getJSONFixture('core/json/customerReports/callMetrics.json');
  const roomData = getJSONFixture('core/json/customerReports/roomData.json');
  const rejectError = {
    status: 500,
  };

  let updateDates = (data: Array<any>, filter: string | undefined, altDate: string | undefined): Array<any> => {
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

  let dataResponse = (data: any): any => {
    return {
      data: {
        data: data,
      },
    };
  };

  beforeEach(function () {
    this.initModules('Core');
    this.injectDependencies('$httpBackend', '$q', 'CommonReportService', 'SparkReportService');

    spyOn(this.CommonReportService, 'returnErrorCheck').and.callFake((error, message, response) => {
      expect(error).toEqual(rejectError);
      expect(message).toEqual(jasmine.any(String));
      return response;
    });
  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  describe('Active User Services', function () {
    it('should return column data getActiveUserData where lineGraph is false', function () {
      spyOn(this.CommonReportService, 'getCustomerReport').and.returnValue(this.$q.when(dataResponse([{
        data: updateDates(_.cloneDeep(activeData.activeDetailed), undefined, undefined),
      }])));

      this.SparkReportService.getActiveUserData(defaults.timeFilter[0], false).then(function (response) {
        expect(response).toEqual({
          graphData: updateDates(_.cloneDeep(activeData.activeResponse), defaults.dayFormat, undefined),
          isActiveUsers: true,
        });
      });
    });

    it('should return line data getActiveUserData where lineGraph is true', function () {
      spyOn(this.CommonReportService, 'getCustomerAltReportByType').and.returnValue(this.$q.when(dataResponse(updateDates(_.cloneDeep(activeData.activeLineData), undefined, undefined))));

      this.SparkReportService.getActiveUserData(defaults.timeFilter[0], true).then(function (response) {
        expect(response).toEqual({
          graphData: updateDates(_.cloneDeep(activeData.activeLineResponse), defaults.dayFormat, undefined),
          isActiveUsers: true,
        });
      });
    });

    it('should notify an error for getActiveUserData where lineGraph is false', function () {
      spyOn(this.CommonReportService, 'getCustomerReport').and.returnValue(this.$q.reject(rejectError));

      this.SparkReportService.getActiveUserData(defaults.timeFilter[0], false).then(function (response) {
        expect(response).toEqual({
          graphData: [],
          isActiveUsers: false,
        });
      });
    });

    it('should notify an error for getActiveUserData where lineGraph is true', function () {
      spyOn(this.CommonReportService, 'getCustomerAltReportByType').and.returnValue(this.$q.reject(rejectError));

      this.SparkReportService.getActiveUserData(defaults.timeFilter[0], true).then(function (response) {
        expect(response).toEqual({
          graphData: [],
          isActiveUsers: false,
        });
      });
    });

    it('should getMostActiveUserData', function () {
      spyOn(this.CommonReportService, 'getCustomerAltReportByType').and.returnValue(this.$q.when({
        data: _.cloneDeep(activeData.mostActive),
      }));

      this.SparkReportService.getMostActiveUserData(defaults.timeFilter[0]).then(function (response) {
        expect(response).toEqual({
          tableData: _.cloneDeep(activeData.mostActiveResponse),
          error: false,
        });
      });
    });

    it('should notify an error for getMostActiveUserData', function () {
      spyOn(this.CommonReportService, 'getCustomerAltReportByType').and.returnValue(this.$q.reject(rejectError));

      this.SparkReportService.getMostActiveUserData(defaults.timeFilter[0]).then(function (response) {
        expect(response).toEqual({
          tableData: [],
          error: true,
        });
      });
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
    });

    it('should notify an error for getAvgRoomData', function () {
      spyOn(this.CommonReportService, 'getCustomerReport').and.returnValue(this.$q.reject(rejectError));

      this.SparkReportService.getAvgRoomData(defaults.timeFilter[0]).then(function (response) {
        expect(response).toEqual([]);
      });
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
    });

    it('should notify an error for getFilesSharedData', function () {
      spyOn(this.CommonReportService, 'getCustomerReport').and.returnValue(this.$q.reject(rejectError));

      this.SparkReportService.getFilesSharedData(defaults.timeFilter[0]).then(function (response) {
        expect(response).toEqual([]);
      });
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
    });

    it('should notify an error for getMediaQualityData', function () {
      spyOn(this.CommonReportService, 'getCustomerReport').and.returnValue(this.$q.reject(rejectError));

      this.SparkReportService.getMediaQualityData(defaults.timeFilter[0]).then(function (response) {
        expect(response).toEqual([]);
      });
    });
  });

  describe('Call Metrics Service', function () {
    it('should getCallMetricsData', function () {
      spyOn(this.CommonReportService, 'getCustomerReport').and.returnValue(this.$q.when(dataResponse(_.cloneDeep(metricsData.data))));

      this.SparkReportService.getCallMetricsData(defaults.timeFilter[0]).then(function (response) {
        expect(response).toEqual(metricsData.response);
      });
    });

    it('should notify an error for getCallMetricsData', function () {
      spyOn(this.CommonReportService, 'getCustomerReport').and.returnValue(this.$q.reject(rejectError));

      this.SparkReportService.getCallMetricsData(defaults.timeFilter[0]).then(function (response) {
        expect(response.dataProvider).toEqual(metricsData.emptyData);
      });
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
    });

    it('should notify an error for getDeviceData', function () {
      spyOn(this.CommonReportService, 'getCustomerReportByType').and.returnValue(this.$q.reject(rejectError));

      this.SparkReportService.getDeviceData(defaults.timeFilter[0]).then(function (response) {
        expect(response).toEqual(devicesJson.emptyData);
      });
    });
  });
});
