import {
  ITimespan,
  IIntervalQuery,
  ICustomerIntervalQuery,
  IReportsCustomer,
  IReportTypeQuery,
  ITypeQuery,
} from '../partnerReportInterfaces';

describe('Service: Common Report Service', () => {
  const customerData = getJSONFixture('core/json/partnerReports/customerResponse.json');
  const defaults = getJSONFixture('core/json/partnerReports/commonReportService.json');
  const cacheValue: boolean = (parseInt(moment.utc().format('H'), 10) >= 8);
  const filter: Array<ITimespan> = _.clone(defaults.timeFilter);
  const today: string = moment().format(defaults.format);
  const dummyResponse = {};

  let queryOne: IIntervalQuery = _.clone(defaults.intervalQuery);
  let queryTwo: IReportTypeQuery = _.clone(defaults.reportTypeQuery);
  let queryThree: ICustomerIntervalQuery = _.clone(defaults.customerIntervalQuery);
  let queryFour: ITypeQuery = _.clone(defaults.typeQuery);
  queryOne.cache = cacheValue;
  queryTwo.cache = cacheValue;
  queryThree.cache = cacheValue;
  queryFour.cache = cacheValue;

  beforeEach(function () {
    this.initModules('Core');
    this.injectDependencies('$httpBackend',
      'CommonReportService',
      'Notification');
    spyOn(this.Notification, 'errorWithTrackingId');
  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  describe('report fetch functions:', function () {
    let customers: Array<IReportsCustomer> = customerData.customerOptions;

    it('getPartnerReport should fetch report data', function () {
      this.$httpBackend.whenGET(defaults.dummyUrls[0].replace('{{cache}}', cacheValue)).respond(dummyResponse);
      this.CommonReportService.getPartnerReport(queryOne, customers, undefined).then(function (response) {
        expect(response.data).toEqual(dummyResponse);
      });
      this.$httpBackend.flush();
    });

    it('getPartnerReportByReportType should fetch report data', function () {
      this.$httpBackend.whenGET(defaults.dummyUrls[1].replace('{{cache}}', cacheValue)).respond(dummyResponse);
      this.CommonReportService.getPartnerReportByReportType(queryTwo, queryOne, customers, undefined).then(function (response) {
        expect(response.data).toEqual(dummyResponse);
      });
      this.$httpBackend.flush();
    });

    it('getCustomerReport should fetch report data', function () {
      this.$httpBackend.whenGET(defaults.dummyUrls[2].replace('{{cache}}', cacheValue)).respond(dummyResponse);
      this.CommonReportService.getCustomerReport(queryThree, undefined).then(function (response) {
        expect(response.data).toEqual(dummyResponse);
      });
      this.$httpBackend.flush();
    });

    it('getCustomerReportByType should fetch report data', function () {
      this.$httpBackend.whenGET(defaults.dummyUrls[3].replace('{{cache}}', cacheValue)).respond(dummyResponse);
      this.CommonReportService.getCustomerReportByType(queryFour, undefined).then(function (response) {
        expect(response.data).toEqual(dummyResponse);
      });
      this.$httpBackend.flush();
    });

    it('getCustomerAltReportByType should fetch report data', function () {
      this.$httpBackend.whenGET(defaults.dummyUrls[4].replace('{{cache}}', cacheValue)).respond(dummyResponse);
      this.CommonReportService.getCustomerAltReportByType(queryFour, undefined).then(function (response) {
        expect(response.data).toEqual(dummyResponse);
      });
      this.$httpBackend.flush();
    });
  });

  describe('returnErrorCheck error responses:', function () {
    const message: string = 'dummyMessage';

    it('should notify unauthorized for 401 error', function () {
      expect(this.CommonReportService.returnErrorCheck(defaults.FourZeroOne, message, dummyResponse)).toEqual(dummyResponse);
      expect(this.Notification.errorWithTrackingId).toHaveBeenCalledWith(defaults.FourZeroOne, defaults.unauthorized);
    });

    it('should notify unauthorized for 403 error', function () {
      expect(this.CommonReportService.returnErrorCheck(defaults.FourZeroThree, message, dummyResponse)).toEqual(dummyResponse);
      expect(this.Notification.errorWithTrackingId).toHaveBeenCalledWith(defaults.FourZeroThree, defaults.unauthorized);
    });

    it('should notify passed in message for non 0 error', function () {
      expect(this.CommonReportService.returnErrorCheck(defaults.nonZeroError, message, dummyResponse)).toEqual(dummyResponse);
      expect(this.Notification.errorWithTrackingId).toHaveBeenCalledWith(defaults.nonZeroError, message);
    });

    it('should notify passed in message for timeout error', function () {
      expect(this.CommonReportService.returnErrorCheck(defaults.timeoutError, message, dummyResponse)).toEqual(dummyResponse);
      expect(this.Notification.errorWithTrackingId).toHaveBeenCalledWith(defaults.timeoutError, message);
    });

    it('should return abort message', function () {
      expect(this.CommonReportService.returnErrorCheck(defaults.zeroError, message, dummyResponse)).toEqual(defaults.ABORT);
      expect(this.Notification.errorWithTrackingId).not.toHaveBeenCalled();
    });
  });

  describe('getReturnGraph responses:', function () {
    let getOffset = (date: number): number => {
      if (date >= 4) {
        return 7 - date;
      } else {
        return -date;
      }
    };

    let buildResponse = (responseType: any): Array<any> => {
      let returnGraph: Array<any> = [];

      if (responseType === 0) {
        for (let i = 7; i > 0; i--) {
          let tmpItem = _.clone(defaults.graphItem);
          tmpItem.date = moment().tz(defaults.timezone)
            .subtract(i, defaults.DAY)
            .format(defaults.dayFormat);
          returnGraph.push(tmpItem);
        }
      } else if (responseType === 1) {
        let dayOffset = getOffset(parseInt(moment().format('e'), 10));
        for (let x = 3; x >= 0; x--) {
          let temp = _.clone(defaults.graphItem);
          temp.date = moment().tz(defaults.timezone)
            .startOf(defaults.WEEK)
            .subtract(dayOffset + (x * 7), defaults.DAY)
            .format(defaults.dayFormat);
          returnGraph.push(temp);
        }
      } else {
        for (let y = 2; y >= 0; y--) {
          let item = _.clone(defaults.graphItem);
          item.date = moment().tz(defaults.timezone)
            .subtract(y, defaults.MONTH)
            .startOf(defaults.MONTH)
            .format(defaults.monthFormat);
          returnGraph.push(item);
        }
      }

      return returnGraph;
    };

    it('should get expected responses for getReturnGraph', function () {
      let graph = this.CommonReportService.getReturnGraph(filter[0], today, defaults.graphItem);
      expect(graph).toEqual(buildResponse(0));

      graph = this.CommonReportService.getReturnGraph(filter[1], today, defaults.graphItem);
      expect(graph).toEqual(buildResponse(1));

      graph = this.CommonReportService.getReturnGraph(filter[2], today, defaults.graphItem);
      expect(graph).toEqual(buildResponse(2));
    });

    let buildAltResponse = (responseType: any): Array<any> => {
      let returnGraph: Array<any> = [];

      if (responseType === 0) {
        for (let i = 8; i > 0; i--) {
          let tmpItem = _.clone(defaults.graphItem);
          tmpItem.date = moment().subtract(i, defaults.DAY)
            .format(defaults.dayFormat);
          returnGraph.push(tmpItem);
        }
      } else if (responseType === 1) {
        for (let x = 4; x >= 0; x--) {
          let temp = _.clone(defaults.graphItem);
          temp.date = moment().day(-1)
            .subtract(x, defaults.WEEK)
            .format(defaults.dayFormat);
          returnGraph.push(temp);
        }
      } else {
        for (let y = 12; y >= 0; y--) {
          let item = _.clone(defaults.graphItem);
          item.date = moment().day(-1)
            .subtract(y, defaults.WEEK)
            .format(defaults.dayFormat);
          returnGraph.push(item);
        }
      }

      return returnGraph;
    };

    it('should get expected responses for getReturnLineGraph', function () {
      let graph = this.CommonReportService.getReturnLineGraph(filter[0], defaults.graphItem);
      expect(graph).toEqual(buildAltResponse(0));

      graph = this.CommonReportService.getReturnLineGraph(filter[1], defaults.graphItem);
      expect(graph).toEqual(buildAltResponse(1));

      graph = this.CommonReportService.getReturnLineGraph(filter[2], defaults.graphItem);
      expect(graph).toEqual(buildAltResponse(2));
    });
  });

  describe('option functions:', function () {
    it('getOptions should return partner options', function () {
      let options: IIntervalQuery = this.CommonReportService.getOptions(filter[0], 'type', 'action');
      expect(options).toEqual(queryOne);

      options = this.CommonReportService.getOptions(filter[1], 'type', 'action');
      let updatedQuery = _.clone(queryOne);
      updatedQuery.intervalCount = 31;
      updatedQuery.spanCount = 7;
      expect(options).toEqual(updatedQuery);

      options = this.CommonReportService.getOptions(filter[2], 'type', 'action');
      updatedQuery.intervalCount = 3;
      updatedQuery.intervalType = defaults.MONTH;
      updatedQuery.spanCount = 1;
      updatedQuery.spanType = defaults.MONTH;
      expect(options).toEqual(updatedQuery);
    });

    it('getOptionsOverPeriod should return partner options', function () {
      let options: IIntervalQuery = this.CommonReportService.getOptionsOverPeriod(filter[0], 'type', 'action');
      let updatedQuery = _.clone(queryOne);
      updatedQuery.spanCount = 7;
      expect(options).toEqual(updatedQuery);

      options = this.CommonReportService.getOptionsOverPeriod(filter[1], 'type', 'action');
      updatedQuery.intervalCount = 31;
      updatedQuery.spanCount = 31;
      expect(options).toEqual(updatedQuery);

      options = this.CommonReportService.getOptionsOverPeriod(filter[2], 'type', 'action');
      updatedQuery.intervalCount = 92;
      updatedQuery.spanCount = 92;
      expect(options).toEqual(updatedQuery);
    });

    it('getTrendOptions should return partner options', function () {
      let options: IIntervalQuery = this.CommonReportService.getTrendOptions(filter[0], 'type', 'action');
      expect(options).toEqual(queryOne);

      options = this.CommonReportService.getTrendOptions(filter[1], 'type', 'action');
      let updatedQuery = _.clone(queryOne);
      updatedQuery.intervalCount = 31;
      expect(options).toEqual(updatedQuery);

      options = this.CommonReportService.getTrendOptions(filter[2], 'type', 'action');
      updatedQuery.intervalCount = 92;
      expect(options).toEqual(updatedQuery);
    });

    it('getReportTypeOptions should return partner reportType options', function () {
      let options: IReportTypeQuery = this.CommonReportService.getReportTypeOptions(filter[0], 'type', 'action');
      let updatedQuery = _.clone(queryTwo);
      updatedQuery.reportType = defaults.usageOptions[0];
      expect(options).toEqual(updatedQuery);

      options = this.CommonReportService.getReportTypeOptions(filter[1], 'type', 'action');
      updatedQuery.reportType = defaults.usageOptions[1];
      expect(options).toEqual(updatedQuery);

      options = this.CommonReportService.getReportTypeOptions(filter[2], 'type', 'action');
      updatedQuery.reportType = defaults.usageOptions[2];
      expect(options).toEqual(updatedQuery);
    });

    it('getTypeOptions should return customer type options', function () {
      let options: ITypeQuery = this.CommonReportService.getTypeOptions(filter[0], 'name');
      let updatedQuery = _.clone(queryFour);
      updatedQuery.type = defaults.usageOptions[0];
      expect(options).toEqual(updatedQuery);

      options = this.CommonReportService.getTypeOptions(filter[1], 'name');
      updatedQuery.type = defaults.usageOptions[1];
      expect(options).toEqual(updatedQuery);

      options = this.CommonReportService.getTypeOptions(filter[2], 'name');
      updatedQuery.type = defaults.usageOptions[2];
      expect(options).toEqual(updatedQuery);
    });

    it('getLineTypeOptions should return customer type options', function () {
      let options: ITypeQuery = this.CommonReportService.getLineTypeOptions(filter[0], 'name');
      let updatedQuery = _.clone(queryFour);
      updatedQuery.type = defaults.altUsageOptions[0];
      expect(options).toEqual(updatedQuery);

      options = this.CommonReportService.getLineTypeOptions(filter[1], 'name');
      updatedQuery.type = defaults.altUsageOptions[1];
      expect(options).toEqual(updatedQuery);

      options = this.CommonReportService.getLineTypeOptions(filter[2], 'name');
      updatedQuery.type = defaults.altUsageOptions[2];
      expect(options).toEqual(updatedQuery);
    });

    it('getCustomerOptions should return customer options', function () {
      let options: ICustomerIntervalQuery = this.CommonReportService.getCustomerOptions(filter[0], 'type', 'action', true);
      expect(options).toEqual(queryThree);

      options = this.CommonReportService.getCustomerOptions(filter[1], 'type', 'action', true);
      let updatedQuery = _.clone(queryThree);
      updatedQuery.intervalCount = 31;
      updatedQuery.spanCount = 7;
      expect(options).toEqual(updatedQuery);

      options = this.CommonReportService.getCustomerOptions(filter[2], 'type', 'action', true);
      updatedQuery.intervalCount = 3;
      updatedQuery.intervalType = defaults.MONTH;
      updatedQuery.spanCount = 1;
      updatedQuery.spanType = defaults.MONTH;
      expect(options).toEqual(updatedQuery);
    });

    it('getAltCustomerOptions should return customer options', function () {
      let options: ICustomerIntervalQuery = this.CommonReportService.getAltCustomerOptions(filter[0], 'type', 'action', true);
      let updatedQuery = _.clone(queryThree);
      updatedQuery.spanCount = 7;
      expect(options).toEqual(updatedQuery);

      options = this.CommonReportService.getAltCustomerOptions(filter[1], 'type', 'action', true);
      updatedQuery.intervalCount = 31;
      updatedQuery.spanCount = 31;
      expect(options).toEqual(updatedQuery);

      options = this.CommonReportService.getAltCustomerOptions(filter[2], 'type', 'action', true);
      updatedQuery.intervalCount = 93;
      updatedQuery.spanCount = 93;
      expect(options).toEqual(updatedQuery);
    });
  });

  describe('getModifiedDate responses:', function () {
    it('should return day-formated response for filter values 0 and 1', function () {
      let responseDate: string = moment.tz(today, defaults.timezone).format(defaults.dayFormat);
      let date: string = this.CommonReportService.getModifiedDate(today, filter[0]);
      let dateTwo: string = this.CommonReportService.getModifiedDate(today, filter[1]);
      expect(date).toEqual(responseDate);
      expect(dateTwo).toEqual(responseDate);
    });

    it('should return month-formated response for filter value 2', function () {
      let responseDate: string = moment.tz(today, defaults.timezone).format(defaults.monthFormat);
      let date: string = this.CommonReportService.getModifiedDate(today, filter[2]);
      expect(date).toEqual(responseDate);
    });
  });
});
