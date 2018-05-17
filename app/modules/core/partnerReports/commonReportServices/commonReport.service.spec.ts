import reportServices from './index';
import {
  IIntervalQuery,
  ICustomerIntervalQuery,
  IReportTypeQuery,
  ITypeQuery,
} from '../partnerReportInterfaces';

describe('Service: Common Report Service', () => {
  beforeEach(function () {
    this.initModules(reportServices);
    this.injectDependencies('$httpBackend', 'CommonReportService', 'Notification');

    this.defaults = getJSONFixture('core/json/partnerReports/commonReportService.json');

    this.cacheValue = (parseInt(moment.utc().format('H'), 10) >= 8);
    this.filter = _.cloneDeep(this.defaults.timeFilter);
    this.today = new Date().toISOString();
    this.message = 'dummyMessage';

    this.queryOne = _.cloneDeep(this.defaults.intervalQuery);
    this.queryTwo = _.cloneDeep(this.defaults.reportTypeQuery);
    this.queryThree = _.cloneDeep(this.defaults.customerIntervalQuery);
    this.queryFour = _.cloneDeep(this.defaults.typeQuery);
    this.queryOne.cache = this.cacheValue;
    this.queryTwo.cache = this.cacheValue;
    this.queryThree.cache = this.cacheValue;
    this.queryFour.cache = this.cacheValue;

    spyOn(this.Notification, 'errorWithTrackingId');
  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  describe('report fetch functions:', function () {
    it('getCustomerReport should fetch report data', function () {
      this.$httpBackend.whenGET(this.defaults.dummyUrls[2].replace('{{cache}}', this.cacheValue)).respond({});
      this.CommonReportService.getCustomerReport(this.queryThree, undefined).then(function (response) {
        expect(response.data).toEqual({});
      });
      this.$httpBackend.flush();
    });

    it('getCustomerReportByType should fetch report data', function () {
      this.$httpBackend.whenGET(this.defaults.dummyUrls[3].replace('{{cache}}', this.cacheValue)).respond({});
      this.CommonReportService.getCustomerReportByType(this.queryFour, undefined).then(function (response) {
        expect(response.data).toEqual({});
      });
      this.$httpBackend.flush();
    });

    it('getCustomerAltReportByType should fetch report data', function () {
      this.$httpBackend.whenGET(this.defaults.dummyUrls[3].replace('{{cache}}', this.cacheValue)).respond({});
      this.CommonReportService.getCustomerAltReportByType(this.queryFour, undefined).then(function (response) {
        expect(response.data).toEqual({});
      });
      this.$httpBackend.flush();
    });

    it('getCustomerActiveUserData should fetch report data', function () {
      this.$httpBackend.whenGET(this.defaults.dummyUrls[4].replace('{{cache}}', this.cacheValue)).respond({});
      this.CommonReportService.getCustomerActiveUserData(this.queryFour, undefined).then(function (response) {
        expect(response.data).toEqual({});
      });
      this.$httpBackend.flush();
    });
  });

  describe('returnErrorCheck error responses:', function () {
    it('should notify unauthorized for 401 error', function () {
      expect(this.CommonReportService.returnErrorCheck(this.defaults.FourZeroOne, this.message, {})).toEqual({});
      expect(this.Notification.errorWithTrackingId).toHaveBeenCalledWith(this.defaults.FourZeroOne, this.defaults.unauthorized);
    });

    it('should notify unauthorized for 403 error', function () {
      expect(this.CommonReportService.returnErrorCheck(this.defaults.FourZeroThree, this.message, {})).toEqual({});
      expect(this.Notification.errorWithTrackingId).toHaveBeenCalledWith(this.defaults.FourZeroThree, this.defaults.unauthorized);
    });

    it('should notify passed in message for non 0 error', function () {
      expect(this.CommonReportService.returnErrorCheck(this.defaults.nonZeroError, this.message, {})).toEqual({});
      expect(this.Notification.errorWithTrackingId).toHaveBeenCalledWith(this.defaults.nonZeroError, this.message);
    });

    it('should notify passed in message for timeout error', function () {
      expect(this.CommonReportService.returnErrorCheck(this.defaults.timeoutError, this.message, {})).toEqual({});
      expect(this.Notification.errorWithTrackingId).toHaveBeenCalledWith(this.defaults.timeoutError, this.message);
    });

    it('should not notify in cases where the API call is aborted', function () {
      expect(this.CommonReportService.returnErrorCheck(this.defaults.zeroError, this.message, {})).toEqual({});
      expect(this.Notification.errorWithTrackingId).not.toHaveBeenCalled();
    });
  });

  describe('getReturnGraph responses:', function () {
    // verify the correct number of objects are returned in the array
    it('should get expected responses for getReturnGraph', function () {
      let graph = this.CommonReportService.getReturnGraph(this.filter[0], this.today, this.defaults.graphItem);
      expect(graph.length).toBe(7);

      graph = this.CommonReportService.getReturnGraph(this.filter[1], this.today, this.defaults.graphItem);
      expect(graph.length).toBe(4);

      graph = this.CommonReportService.getReturnGraph(this.filter[2], this.today, this.defaults.graphItem);
      expect(graph.length).toBe(3);
    });

    // verify the correct number of objects are returned in the array
    it('should get expected responses for getReturnLineGraph', function () {
      let graph = this.CommonReportService.getReturnLineGraph(this.filter[0], this.defaults.graphItem);
      expect(graph.length).toBe(7);

      graph = this.CommonReportService.getReturnLineGraph(this.filter[1], this.defaults.graphItem);
      expect(graph.length).toBe(52);
    });
  });

  describe('option functions:', function () {
    it('getOptions should return partner options', function () {
      let options: IIntervalQuery = this.CommonReportService.getOptions(this.filter[0], 'type', 'action');
      expect(options).toEqual(this.queryOne);

      options = this.CommonReportService.getOptions(this.filter[1], 'type', 'action');
      const updatedQuery = _.cloneDeep(this.queryOne);
      updatedQuery.intervalCount = 31;
      updatedQuery.spanCount = 7;
      expect(options).toEqual(updatedQuery);

      options = this.CommonReportService.getOptions(this.filter[2], 'type', 'action');
      updatedQuery.intervalCount = 3;
      updatedQuery.intervalType = this.defaults.MONTH;
      updatedQuery.spanCount = 1;
      updatedQuery.spanType = this.defaults.MONTH;
      expect(options).toEqual(updatedQuery);
    });

    it('getOptionsOverPeriod should return partner options', function () {
      let options: IIntervalQuery = this.CommonReportService.getOptionsOverPeriod(this.filter[0], 'type', 'action');
      const updatedQuery = _.cloneDeep(this.queryOne);
      updatedQuery.spanCount = 7;
      expect(options).toEqual(updatedQuery);

      options = this.CommonReportService.getOptionsOverPeriod(this.filter[1], 'type', 'action');
      updatedQuery.intervalCount = 31;
      updatedQuery.spanCount = 31;
      expect(options).toEqual(updatedQuery);

      options = this.CommonReportService.getOptionsOverPeriod(this.filter[2], 'type', 'action');
      updatedQuery.intervalCount = 92;
      updatedQuery.spanCount = 92;
      expect(options).toEqual(updatedQuery);
    });

    it('getTrendOptions should return partner options', function () {
      let options: IIntervalQuery = this.CommonReportService.getTrendOptions(this.filter[0], 'type', 'action');
      expect(options).toEqual(this.queryOne);

      options = this.CommonReportService.getTrendOptions(this.filter[1], 'type', 'action');
      const updatedQuery = _.cloneDeep(this.queryOne);
      updatedQuery.intervalCount = 31;
      expect(options).toEqual(updatedQuery);

      options = this.CommonReportService.getTrendOptions(this.filter[2], 'type', 'action');
      updatedQuery.intervalCount = 92;
      expect(options).toEqual(updatedQuery);
    });

    it('getReportTypeOptions should return partner reportType options', function () {
      let options: IReportTypeQuery = this.CommonReportService.getReportTypeOptions(this.filter[0], 'type', 'action');
      const updatedQuery = _.cloneDeep(this.queryTwo);
      updatedQuery.reportType = this.defaults.usageOptions[0];
      expect(options).toEqual(updatedQuery);

      options = this.CommonReportService.getReportTypeOptions(this.filter[1], 'type', 'action');
      updatedQuery.reportType = this.defaults.usageOptions[1];
      expect(options).toEqual(updatedQuery);

      options = this.CommonReportService.getReportTypeOptions(this.filter[2], 'type', 'action');
      updatedQuery.reportType = this.defaults.usageOptions[2];
      expect(options).toEqual(updatedQuery);
    });

    it('getTypeOptions should return customer type options', function () {
      let options: ITypeQuery = this.CommonReportService.getTypeOptions(this.filter[0], 'name');
      const updatedQuery = _.cloneDeep(this.queryFour);
      updatedQuery.type = this.defaults.usageOptions[0];
      updatedQuery.extension = undefined;
      expect(options).toEqual(updatedQuery);

      options = this.CommonReportService.getTypeOptions(this.filter[1], 'name');
      updatedQuery.type = this.defaults.usageOptions[1];
      expect(options).toEqual(updatedQuery);

      options = this.CommonReportService.getTypeOptions(this.filter[2], 'name');
      updatedQuery.type = this.defaults.usageOptions[2];
      expect(options).toEqual(updatedQuery);
    });

    it('getLineTypeOptions should return customer type options', function () {
      let options: ITypeQuery = this.CommonReportService.getLineTypeOptions(this.filter[0], 'name');
      const updatedQuery = _.cloneDeep(this.queryFour);
      updatedQuery.type = this.defaults.altUsageOptions[0];
      updatedQuery.extension = undefined;
      expect(options).toEqual(updatedQuery);

      options = this.CommonReportService.getLineTypeOptions(this.filter[1], 'name');
      updatedQuery.type = this.defaults.altUsageOptions[1];
      expect(options).toEqual(updatedQuery);

      options = this.CommonReportService.getLineTypeOptions(this.filter[2], 'name');
      updatedQuery.type = this.defaults.altUsageOptions[1];
      expect(options).toEqual(updatedQuery);
    });

    it('getCustomerOptions should return customer options', function () {
      let options: ICustomerIntervalQuery = this.CommonReportService.getCustomerOptions(this.filter[0], 'type', 'action', true);
      expect(options).toEqual(this.queryThree);

      options = this.CommonReportService.getCustomerOptions(this.filter[1], 'type', 'action', true);
      const updatedQuery = _.cloneDeep(this.queryThree);
      updatedQuery.intervalCount = 31;
      updatedQuery.spanCount = 7;
      expect(options).toEqual(updatedQuery);

      options = this.CommonReportService.getCustomerOptions(this.filter[2], 'type', 'action', true);
      updatedQuery.intervalCount = 3;
      updatedQuery.intervalType = this.defaults.MONTH;
      updatedQuery.spanCount = 1;
      updatedQuery.spanType = this.defaults.MONTH;
      expect(options).toEqual(updatedQuery);
    });

    it('getAltCustomerOptions should return customer options', function () {
      let options: ICustomerIntervalQuery = this.CommonReportService.getAltCustomerOptions(this.filter[0], 'type', 'action', true);
      const updatedQuery = _.cloneDeep(this.queryThree);
      updatedQuery.spanCount = 7;
      expect(options).toEqual(updatedQuery);

      options = this.CommonReportService.getAltCustomerOptions(this.filter[1], 'type', 'action', true);
      updatedQuery.intervalCount = 31;
      updatedQuery.spanCount = 31;
      expect(options).toEqual(updatedQuery);

      options = this.CommonReportService.getAltCustomerOptions(this.filter[2], 'type', 'action', true);
      updatedQuery.intervalCount = 93;
      updatedQuery.spanCount = 93;
      expect(options).toEqual(updatedQuery);
    });
  });

  describe('getModifiedDate responses:', function () {
    it('should return day-formated response for filter values 0 and 1', function () {
      const responseDate: string = moment.tz(this.today, this.defaults.timezone).format(this.defaults.dayFormat);
      const date: string = this.CommonReportService.getModifiedDate(this.today, this.filter[0]);
      const dateTwo: string = this.CommonReportService.getModifiedDate(this.today, this.filter[1]);
      expect(date).toEqual(responseDate);
      expect(dateTwo).toEqual(responseDate);
    });

    it('should return month-formated response for filter value 2', function () {
      const responseDate: string = moment.tz(this.today, this.defaults.timezone).format(this.defaults.monthFormat);
      const date: string = this.CommonReportService.getModifiedDate(this.today, this.filter[2]);
      expect(date).toEqual(responseDate);
    });
  });

  it('getPercentage should return percentage of two numbers', function () {
    expect(this.CommonReportService.getPercentage(1, 2)).toEqual(50);
  });
});
