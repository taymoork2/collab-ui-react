import {
  ITimespan,
  IIntervalQuery,
  ICustomerIntervalQuery,
  IReportsCustomer,
  IReportTypeQuery,
  ITypeQuery,
} from '../partnerReportInterfaces';

export class CommonReportService {
  private ABORT: string = 'ABORT';
  private CACHE: string = '&cache=';
  private ICOUNT: string = '&intervalCount=';
  private ITYPE: string = '&intervalType=';
  private SCOUNT: string = '&spanCount=';
  private STYPE: string = '&spanType=';
  private CVIEW: string = '&isCustomerView=true';
  private ORGID: string = '&orgId=';
  private DAY: string = 'day';
  private WEEK: string = 'week';
  private MONTH: string = 'month';
  private DAY_FORMAT: string = 'MMM DD';
  private MONTH_FORMAT: string = 'MMMM';
  private TIMEZONE: string = 'Etc/GMT';

  private usageOptions: Array<string> = ['weeklyUsage', 'monthlyUsage', 'threeMonthUsage'];
  private altUsageOptions: Array<string> = ['dailyUsage', 'monthlyUsage', 'yearlyUsage'];
  private cacheValue: boolean = (parseInt(moment.utc().format('H'), 10) >= 8);

  /* @ngInject */
  constructor(
    private $http: ng.IHttpService,
    private Authinfo,
    private Notification,
    private UrlConfig
  ) {}

  private urlBase = this.UrlConfig.getAdminServiceUrl() + 'organization/' + this.Authinfo.getOrgId() + '/reports/';

  private getService(url: string, cancelPromise: ng.IDeferred<any>): ng.IHttpPromise<any> {
    if (cancelPromise) {
      return this.$http.get(url, {
        timeout: cancelPromise.promise,
      });
    } else {
      return this.$http.get(url);
    }
  }

  private getQuery(options: any): string {
    return this.ICOUNT + options.intervalCount + this.ITYPE + options.intervalType + this.SCOUNT + options.spanCount + this.STYPE + options.spanType + this.CACHE + options.cache;
  }

  private getCustomerQuery(customers: Array<IReportsCustomer>): string {
    let url: string = '';
    _.forEach(customers, (customer) => {
      url += this.ORGID + customer.value;
    });
    return url;
  }

  public getPartnerReport(options: IIntervalQuery, customers: Array<IReportsCustomer>, cancelPromise: ng.IDeferred<any>): ng.IHttpPromise<any> {
    let url = this.urlBase + options.action + '/managedOrgs/' + options.type + '?' + this.getQuery(options);
    if (customers) {
      url += this.getCustomerQuery(customers);
    }
    return this.getService(url, cancelPromise);
  }

  // TODO: remove unnecessary IIntervalQuery options once API stops requiring them
  public getPartnerReportByReportType(options: IReportTypeQuery, extraOptions: IIntervalQuery, customers: Array<IReportsCustomer>, cancelPromise: ng.IDeferred<any>): ng.IHttpPromise<any> {
    let url = this.urlBase + options.action + '/managedOrgs/' + options.type + '?type=' + options.reportType + this.getQuery(extraOptions) + this.getCustomerQuery(customers);
    return this.getService(url, cancelPromise);
  }

  public getCustomerReport(options: ICustomerIntervalQuery, cancelPromise: ng.IDeferred<any>): ng.IHttpPromise<any> {
    let url = this.urlBase + options.action + '/' + options.type + '?' + this.getQuery(options);
    if (options.customerView) {
      url += this.CVIEW;
    }
    return this.getService(url, cancelPromise);
  }

  public getCustomerReportByType(options: ITypeQuery, cancelPromise: ng.IDeferred<any>): ng.IHttpPromise<any> {
    let url = this.urlBase + options.name + '?type=' + options.type + this.CACHE + options.cache;
    return this.getService(url, cancelPromise);
  }

  public getCustomerAltReportByType(options: ITypeQuery, cancelPromise: ng.IDeferred<any>): ng.IHttpPromise<any> {
    let url = this.urlBase + options.name + '/' + options.type + '?' + this.CACHE + options.cache;
    return this.getService(url, cancelPromise);
  }

  public returnErrorCheck(error, message: string, returnItem: any): any {
    if (error.status === 401 || error.status === 403) {
      this.Notification.errorWithTrackingId(error, 'reportsPage.unauthorizedError');
      return returnItem;
    } else if ((error.status !== 0) || (error.config.timeout.$$state.status === 0)) {
      this.Notification.errorWithTrackingId(error, message);
      return returnItem;
    } else {
      return this.ABORT;
    }
  }

  public getReturnGraph(filter: ITimespan, date: string, graphItem: any): Array<any> {
    let returnGraph: Array<any> = [];

    if (filter.value === 0) {
      for (let i = 7; i > 0; i--) {
        let tmpItem: any = _.clone(graphItem);
        tmpItem.date = moment().tz(this.TIMEZONE)
          .subtract(i, this.DAY)
          .format(this.DAY_FORMAT);
        returnGraph.push(tmpItem);
      }
    } else if (filter.value === 1) {
      if (date === '') {
        date = moment().subtract(1, this.DAY).format(this.DAY_FORMAT);
      }
      let dayOffset: number = this.getOffset(parseInt(moment.tz(date, this.TIMEZONE).format('e'), 10));
      for (let x = 3; x >= 0; x--) {
        let temp: any = _.clone(graphItem);
        temp.date = moment().tz(this.TIMEZONE)
          .startOf(this.WEEK)
          .subtract(dayOffset + (x * 7), this.DAY)
          .format(this.DAY_FORMAT);
        returnGraph.push(temp);
      }
    } else {
      for (let y = 2; y >= 0; y--) {
        let item: any = _.clone(graphItem);
        item.date = moment().tz(this.TIMEZONE)
          .subtract(y, this.MONTH)
          .startOf(this.MONTH)
          .format(this.MONTH_FORMAT);
        returnGraph.push(item);
      }
    }

    return returnGraph;
  }

  public getReturnLineGraph(filter: ITimespan, graphItem: any): Array<any> {
    let returnGraph: Array<any> = [];

    if (filter.value === 0) {
      for (let i = 8; i > 0; i--) {
        let tmpItem: any = _.clone(graphItem);
        tmpItem.date = moment().tz(this.TIMEZONE)
          .subtract(i, this.DAY)
          .format(this.DAY_FORMAT);
        returnGraph.push(tmpItem);
      }
    } else if (filter.value === 1) {
      for (let x = 4; x >= 0; x--) {
        let temp: any = _.clone(graphItem);
        temp.date = moment().day(-1)
          .subtract(x, this.WEEK)
          .format(this.DAY_FORMAT);
        returnGraph.push(temp);
      }
    } else {
      for (let z = 52; z >= 0; z--) {
        let item = _.clone(graphItem);
        item.date = moment().day(-1)
          .subtract(z, this.WEEK)
          .format(this.DAY_FORMAT);
        returnGraph.push(item);
      }
    }

    return returnGraph;
  }

  private getOffset(date: number): number {
    if (date >= 4) {
      return 7 - date;
    } else {
      return -date;
    }
  }

  public getOptions(filter: ITimespan, type: string, action: string): IIntervalQuery {
    let reportOptions: IIntervalQuery = {
      action: action,
      type: type,
      intervalCount: 7,
      intervalType: this.DAY,
      spanCount: 1,
      spanType: this.DAY,
      cache: this.cacheValue,
    };
    if (filter.value === 1) {
      reportOptions.intervalCount = 31;
      reportOptions.spanCount = 7;
    } else if (filter.value === 2) {
      reportOptions.intervalCount = 3;
      reportOptions.intervalType = this.MONTH;
      reportOptions.spanCount = 1;
      reportOptions.spanType = this.MONTH;
    }
    return reportOptions;
  }

  public getOptionsOverPeriod(filter: ITimespan, type: string, action: string): IIntervalQuery {
    let reportOptions: IIntervalQuery = {
      action: action,
      type: type,
      intervalCount: 7,
      intervalType: this.DAY,
      spanCount: 7,
      spanType: this.DAY,
      cache: this.cacheValue,
    };
    if (filter.value === 1) {
      reportOptions.intervalCount = 31;
      reportOptions.spanCount = 31;
    } else if (filter.value === 2) {
      reportOptions.intervalCount = 92;
      reportOptions.spanCount = 92;
    }
    return reportOptions;
  }

  public getTrendOptions(filter: ITimespan, type: string, action: string): IIntervalQuery {
    let reportOptions: IIntervalQuery = {
      action: action,
      type: type,
      intervalCount: 7,
      intervalType: this.DAY,
      spanCount: 1,
      spanType: this.DAY,
      cache: this.cacheValue,
    };
    if (filter.value === 1) {
      reportOptions.intervalCount = 31;
    } else if (filter.value === 2) {
      reportOptions.intervalCount = 92;
    }
    return reportOptions;
  }

  public getReportTypeOptions(filter: ITimespan, type: string, action: string): IReportTypeQuery {
    return {
      action: action,
      type: type,
      reportType: this.usageOptions[filter.value],
      cache: this.cacheValue,
    };
  }

  public getTypeOptions(filter: ITimespan, name: string): ITypeQuery {
    return {
      name: name,
      type: this.usageOptions[filter.value],
      cache: this.cacheValue,
    };
  }

  public getLineTypeOptions(filter: ITimespan, name: string): ITypeQuery {
    return {
      name: name,
      type: this.altUsageOptions[filter.value],
      cache: this.cacheValue,
    };
  }

  public getCustomerOptions(filter: ITimespan, type: string, action: string, customerView: boolean): ICustomerIntervalQuery {
    let reportOptions: ICustomerIntervalQuery = {
      action: action,
      type: type,
      intervalCount: 7,
      intervalType: this.DAY,
      spanCount: 1,
      spanType: this.DAY,
      cache: this.cacheValue,
      customerView: customerView,
    };
    if (filter.value === 1) {
      reportOptions.intervalCount = 31;
      reportOptions.spanCount = 7;
    } else if (filter.value === 2) {
      reportOptions.intervalCount = 3;
      reportOptions.intervalType = this.MONTH;
      reportOptions.spanCount = 1;
      reportOptions.spanType = this.MONTH;
    }
    return reportOptions;
  }

  public getAltCustomerOptions(filter: ITimespan, type: string, action: string, customerView: boolean): ICustomerIntervalQuery {
    let reportOptions: ICustomerIntervalQuery = {
      action: action,
      type: type,
      intervalCount: 7,
      intervalType: this.DAY,
      spanCount: 7,
      spanType: this.DAY,
      cache: this.cacheValue,
      customerView: customerView,
    };
    if (filter.value === 1) {
      reportOptions.intervalCount = 31;
      reportOptions.spanCount = 31;
    } else if (filter.value === 2) {
      reportOptions.intervalCount = 93;
      reportOptions.spanCount = 93;
    }
    return reportOptions;
  }

  public getModifiedDate(date: string, filter: ITimespan): string {
    let modifiedDate: string = moment.tz(date, this.TIMEZONE).format(this.DAY_FORMAT);
    if (filter.value > 1) {
      modifiedDate = moment.tz(date, this.TIMEZONE).format(this.MONTH_FORMAT);
    }
    return modifiedDate;
  }

  public getModifiedLineDate(date: string): string {
    return moment.tz(date, this.TIMEZONE).format(this.DAY_FORMAT);
  }
}

angular.module('Core')
  .service('CommonReportService', CommonReportService);
