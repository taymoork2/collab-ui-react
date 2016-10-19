import {
  IFilterObject,
  ITimespan,
} from '../partnerReportInterfaces';

export class ReportConstants {
  public readonly ABORT: string = 'ABORT';

  // Numerical Constants
  public readonly DAYS: number = 7;
  public readonly FIXED: number = 2;
  public readonly INTEGER_BASE = 10;
  public readonly LINE_WEEKS: number = 4;
  public readonly MONTHS: number = 2;
  public readonly PERCENTAGE_MULTIPLIER: number = 100;
  public readonly THIRTEEN_WEEKS: number = 13;
  public readonly WEEKS: number = 3;
  public readonly YEAR: number = 52;

  // moment formatting helpers
  public readonly DAY_FORMAT: string = 'MMM DD';
  public readonly MONTH_FORMAT: string = 'MMMM';
  public readonly TIMEZONE: string = 'Etc/GMT';
  public readonly DAY: string = 'day';
  public readonly WEEK: string = 'week';
  public readonly MONTH: string = 'month';

  // Refresh/Set/Empty tracking
  public readonly REFRESH: string = 'refresh';
  public readonly SET: string = 'set';
  public readonly EMPTY: string = 'empty';
  public readonly ERROR: string = 'error';

  // Chart Types
  public readonly BARCHART: string = 'barchart';
  public readonly DONUT: string = 'donut';
  public readonly TABLE: string = 'table';
  public readonly UNDEF: string = 'undefined';

  // Report visibility
  public readonly ALL: string = 'all';
  public readonly ENGAGEMENT: string = 'engagement';
  public readonly QUALITY: string = 'quality';

  // Report Filtering All/Engagement/quality
  public readonly filterArray: Array<IFilterObject> = [{
    id: 'allReports',
    label: 'reportsPage.all',
    selected: true,
    toggle: undefined,
  }, {
    id: 'engagementReports',
    label: 'reportsPage.engagement',
    selected: false,
    toggle: undefined,
  }, {
    id: 'qualityReports',
    label: 'reportsPage.quality',
    selected: false,
    toggle: undefined,
  }];

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService
  ) {}

  // Time Filter
  public FILTER_ONE: ITimespan = {
    value: 0,
    label: this.$translate.instant('reportsPage.week'),
    description: this.$translate.instant('reportsPage.week2'),
  };
  public FILTER_TWO: ITimespan = {
    value: 1,
    label: this.$translate.instant('reportsPage.month'),
    description: this.$translate.instant('reportsPage.month2'),
  };
  public FILTER_THREE: ITimespan = {
    value: 2,
    label: this.$translate.instant('reportsPage.threeMonths'),
    description: this.$translate.instant('reportsPage.threeMonths2'),
  };
  public timeFilter: Array<ITimespan> = [this.FILTER_ONE, this.FILTER_TWO, this.FILTER_THREE];
}

angular.module('Core')
  .service('ReportConstants', ReportConstants);
