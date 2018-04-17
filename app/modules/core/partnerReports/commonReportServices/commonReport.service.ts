import { ReportConstants } from './reportConstants.service';
import {
  ITimespan,
  IIntervalQuery,
  ICustomerIntervalQuery,
  IReportsCustomer,
  IReportTypeQuery,
  ITypeQuery,
} from '../partnerReportInterfaces';
import { Notification } from 'modules/core/notifications';

export class CommonReportService {
  // public API helpers
  public readonly DETAILED: string = 'detailed';
  public readonly TIME_CHARTS: string = 'timeCharts';

  // private API helpers
  private readonly CACHE: string = '&cache=';
  private readonly TYPE: string = '?type=';
  private readonly ICOUNT: string = '&intervalCount=';
  private readonly ITYPE: string = '&intervalType=';
  private readonly SCOUNT: string = '&spanCount=';
  private readonly STYPE: string = '&spanType=';
  private readonly CVIEW: string = '&isCustomerView=true';
  private readonly ORGID: string = '&orgId=';

  /* @ngInject */
  constructor(
    private $http: ng.IHttpService,
    private Authinfo,
    private Notification: Notification,
    private ReportConstants: ReportConstants,
    private UrlConfig,
  ) {}

  private readonly usageOptions: string[] = ['weeklyUsage', 'monthlyUsage', 'threeMonthUsage'];
  private readonly altUsageOptions: string[] = ['dailyUsage', 'weeklyUsage'];
  private readonly cacheValue: boolean = (_.toInteger(moment.utc().format('H')) >= 8);
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

  private getCustomerQuery(customers: IReportsCustomer[]): string {
    let url: string = '';
    _.forEach(customers, (customer) => {
      url += this.ORGID + customer.value;
    });
    return url;
  }

  public getPartnerReport(options: IIntervalQuery, customers: IReportsCustomer[] | undefined, cancelPromise: ng.IDeferred<any>): ng.IHttpPromise<any> {
    let url = this.urlBase + options.action + '/managedOrgs/' + options.type + '?' + this.getQuery(options);
    if (customers) {
      url += this.getCustomerQuery(customers);
    }
    return this.getService(url, cancelPromise);
  }

  // TODO: remove unnecessary IIntervalQuery options once API stops requiring them
  public getPartnerReportByReportType(options: IReportTypeQuery, extraOptions: IIntervalQuery, customers: IReportsCustomer[], cancelPromise: ng.IDeferred<any>): ng.IHttpPromise<any> {
    const url = this.urlBase + options.action + '/managedOrgs/' + options.type + this.TYPE + options.reportType + this.getQuery(extraOptions) + this.getCustomerQuery(customers);
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
    const url = this.urlBase + options.name + this.TYPE + options.type + this.CACHE + options.cache;
    return this.getService(url, cancelPromise);
  }

  public getCustomerActiveUserData(options: ITypeQuery, cancelPromise: ng.IDeferred<any>): ng.IHttpPromise<any> {
    return this.getService(this.urlBase + options.name + '/' + options.type + '?' + this.CACHE + options.cache, cancelPromise);
  }

  public getCustomerAltReportByType(options: ITypeQuery, cancelPromise: ng.IDeferred<any>): ng.IHttpPromise<any> {
    let url = this.urlBase;
    if (options.extension) {
      url += options.extension + '/';
    }
    url += options.name + this.TYPE + options.type + this.CACHE + options.cache;

    return this.getService(url, cancelPromise);
  }

  public returnErrorCheck<T = any>(error, message: string, returnItem: T): T {
    if (error.status === 401 || error.status === 403) {
      this.Notification.errorWithTrackingId(error, 'reportsPage.unauthorizedError');
    } else if ((error.status !== 0) || (error.config.timeout.$$state.status === 0)) {
      this.Notification.errorWithTrackingId(error, message);
    }
    return returnItem;
  }

  public getReturnGraph(filter: ITimespan, date: string, graphItem: any): any[] {
    const returnGraph: any[] = [];

    if (filter.value === 0) {
      for (let i = 7; i > 0; i--) {
        const tmpItem: any = _.clone(graphItem);
        tmpItem.date = moment().tz(this.ReportConstants.TIMEZONE)
          .subtract(i, this.ReportConstants.DAY)
          .format(this.ReportConstants.DAY_FORMAT);
        returnGraph.push(tmpItem);
      }
    } else if (filter.value === 1) {
      if (date === '') {
        date = moment().subtract(1, this.ReportConstants.DAY).format();
      }
      const dayOffset: number = this.getOffset(_.toInteger(moment.tz(date, this.ReportConstants.TIMEZONE).format('e')));
      for (let x = 3; x >= 0; x--) {
        const temp: any = _.clone(graphItem);
        temp.date = moment().tz(this.ReportConstants.TIMEZONE)
          .startOf(this.ReportConstants.WEEK)
          .subtract(dayOffset + (x * 7), this.ReportConstants.DAY)
          .format(this.ReportConstants.DAY_FORMAT);
        returnGraph.push(temp);
      }
    } else {
      for (let y = 2; y >= 0; y--) {
        const item: any = _.clone(graphItem);
        item.date = moment().tz(this.ReportConstants.TIMEZONE)
          .subtract(y, this.ReportConstants.MONTH)
          .startOf(this.ReportConstants.MONTH)
          .format(this.ReportConstants.MONTH_FORMAT);
        returnGraph.push(item);
      }
    }

    return returnGraph;
  }

  public getReturnLineGraph(filter: ITimespan, graphItem: any): any[] {
    const returnGraph: any[] = [];

    if (filter.value === this.ReportConstants.WEEK_FILTER.value) {
      for (let i = this.ReportConstants.DAYS; i >= 0; i--) {
        const tmpItem: any = _.clone(graphItem);
        tmpItem.date = moment().tz(this.ReportConstants.TIMEZONE)
          .subtract(i + 1, this.ReportConstants.DAY)
          .format(this.ReportConstants.DAY_FORMAT);
        returnGraph.push(tmpItem);
      }
    } else {
      for (let z = this.ReportConstants.YEAR; z >= 0; z--) {
        const item = _.clone(graphItem);
        item.date = moment().day(-1)
          .subtract(z, this.ReportConstants.WEEK)
          .format(this.ReportConstants.DAY_FORMAT);
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
    const reportOptions: IIntervalQuery = {
      action: action,
      type: type,
      intervalCount: 7,
      intervalType: this.ReportConstants.DAY,
      spanCount: 1,
      spanType: this.ReportConstants.DAY,
      cache: this.cacheValue,
    };
    if (filter.value === 1) {
      reportOptions.intervalCount = 31;
      reportOptions.spanCount = 7;
    } else if (filter.value === 2) {
      reportOptions.intervalCount = 3;
      reportOptions.intervalType = this.ReportConstants.MONTH;
      reportOptions.spanCount = 1;
      reportOptions.spanType = this.ReportConstants.MONTH;
    }
    return reportOptions;
  }

  public getOptionsOverPeriod(filter: ITimespan, type: string, action: string): IIntervalQuery {
    const reportOptions: IIntervalQuery = {
      action: action,
      type: type,
      intervalCount: 7,
      intervalType: this.ReportConstants.DAY,
      spanCount: 7,
      spanType: this.ReportConstants.DAY,
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
    const reportOptions: IIntervalQuery = {
      action: action,
      type: type,
      intervalCount: 7,
      intervalType: this.ReportConstants.DAY,
      spanCount: 1,
      spanType: this.ReportConstants.DAY,
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
      extension: undefined,
      type: this.usageOptions[filter.value],
      cache: this.cacheValue,
    };
  }

  public getLineTypeOptions(filter: ITimespan, name: string, extension: string | undefined): ITypeQuery {
    if (filter.value === this.ReportConstants.WEEK_FILTER.value) {
      return {
        name: name,
        extension: extension,
        type: this.altUsageOptions[0],
        cache: this.cacheValue,
      };
    } else {
      return {
        name: name,
        extension: extension,
        type: this.altUsageOptions[1],
        cache: this.cacheValue,
      };
    }
  }

  public getCustomerOptions(filter: ITimespan, type: string, action: string, customerView: boolean | undefined): ICustomerIntervalQuery {
    const reportOptions: ICustomerIntervalQuery = {
      action: action,
      type: type,
      intervalCount: 7,
      intervalType: this.ReportConstants.DAY,
      spanCount: 1,
      spanType: this.ReportConstants.DAY,
      cache: this.cacheValue,
      customerView: customerView,
    };
    if (filter.value === 1) {
      reportOptions.intervalCount = 31;
      reportOptions.spanCount = 7;
    } else if (filter.value === 2) {
      reportOptions.intervalCount = 3;
      reportOptions.intervalType = this.ReportConstants.MONTH;
      reportOptions.spanCount = 1;
      reportOptions.spanType = this.ReportConstants.MONTH;
    }
    return reportOptions;
  }

  public getAltCustomerOptions(filter: ITimespan, type: string, action: string, customerView: boolean | undefined): ICustomerIntervalQuery {
    const reportOptions: ICustomerIntervalQuery = {
      action: action,
      type: type,
      intervalCount: 7,
      intervalType: this.ReportConstants.DAY,
      spanCount: 7,
      spanType: this.ReportConstants.DAY,
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
    let modifiedDate: string = moment.tz(date, this.ReportConstants.TIMEZONE).format(this.ReportConstants.DAY_FORMAT);
    if (filter.value === this.ReportConstants.THREE_MONTH_FILTER.value) {
      modifiedDate = moment.tz(date, this.ReportConstants.TIMEZONE).format(this.ReportConstants.MONTH_FORMAT);
    }
    return modifiedDate;
  }

  public getModifiedLineDate(date: string): string {
    return moment.tz(date, this.ReportConstants.TIMEZONE).format(this.ReportConstants.DAY_FORMAT);
  }

  public getPercentage(numberOne: number, numberTwo: number): number {
    return Math.round((numberOne / numberTwo) * this.ReportConstants.PERCENTAGE_MULTIPLIER);
  }
}
