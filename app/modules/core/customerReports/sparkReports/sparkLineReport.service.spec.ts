describe('Service: Customer Reports Service', function () {
  const activeData = getJSONFixture('core/json/customerReports/activeUser.json');
  const conversationData = getJSONFixture('core/json/customerReports/conversation.json');
  const defaults = getJSONFixture('core/json/partnerReports/commonReportService.json');
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
    this.injectDependencies('$scope', '$q', 'CommonReportService', 'SparkLineReportService');

    spyOn(this.CommonReportService, 'returnErrorCheck').and.callFake((error, message, response) => {
      expect(error).toEqual(rejectError);
      expect(message).toEqual(jasmine.any(String));
      return response;
    });
  });

  describe('Active User Services', function () {
    it('should return column data getActiveUserData', function () {
      spyOn(this.CommonReportService, 'getCustomerAltReportByType').and.returnValue(this.$q.when(dataResponse(updateDates(_.cloneDeep(activeData.activeLineData), undefined, undefined))));

      this.SparkLineReportService.getActiveUserData(defaults.timeFilter[0]).then(function (response) {
        expect(response).toEqual({
          graphData: updateDates(_.cloneDeep(activeData.activeLineResponse), defaults.dayFormat, undefined),
          isActiveUsers: true,
        });
      });
      this.$scope.$apply();
    });

    it('should notify an error for getActiveUserData', function () {
      spyOn(this.CommonReportService, 'getCustomerAltReportByType').and.returnValue(this.$q.reject(rejectError));

      this.SparkLineReportService.getActiveUserData(defaults.timeFilter[0]).then(function (response) {
        expect(response).toEqual({
          graphData: [],
          isActiveUsers: false,
        });
      });
      this.$scope.$apply();
    });

    it('should getMostActiveUserData', function () {
      spyOn(this.CommonReportService, 'getCustomerAltReportByType').and.returnValue(this.$q.when({
        data: _.cloneDeep(activeData.mostActive),
      }));

      this.SparkLineReportService.getMostActiveUserData(defaults.timeFilter[0]).then(function (response) {
        expect(response).toEqual(_.cloneDeep(activeData.mostActiveResponse));
      });
      this.$scope.$apply();
    });

    it('should notify an error for getMostActiveUserData', function () {
      spyOn(this.CommonReportService, 'getCustomerAltReportByType').and.returnValue(this.$q.reject(rejectError));

      this.SparkLineReportService.getMostActiveUserData(defaults.timeFilter[0]).then(function (response) {
        expect(response).toEqual([]);
      });
      this.$scope.$apply();
    });
  });

  describe('Active User Services', function () {
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
});
