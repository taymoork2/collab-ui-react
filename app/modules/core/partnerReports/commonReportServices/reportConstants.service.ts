import {
  IDropdownBase,
  IFilterObject,
  ITimespan,
} from '../partnerReportInterfaces';

export class ReportConstants {
  public readonly ABORT: string = 'ABORT';

  // Numerical Constants
  public readonly DAYS: number = 7;
  public readonly FIXED: number = 2;
  public readonly MONTHS: number = 2;
  public readonly PERCENTAGE_MULTIPLIER: number = 100;
  public readonly THIRTEEN_WEEKS: number = 13;
  public readonly WEEKS: number = 3;
  public readonly YEAR: number = 52;
  public readonly FOUR_WEEKS: number = 49;
  public readonly TWELVE_WEEKS: number = 41;

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

  public WEEK_FILTER: ITimespan = {
    value: 0,
    label: this.$translate.instant('reportsPage.week'),
    description: this.$translate.instant('reportsPage.week2'),
    min: 1,
    max: this.DAYS,
  };
  public MONTH_FILTER: ITimespan = {
    value: 1,
    label: this.$translate.instant('reportsPage.month'),
    description: this.$translate.instant('reportsPage.month2'),
    min: this.FOUR_WEEKS,
    max: this.YEAR,
  };
  public THREE_MONTH_FILTER: ITimespan = {
    value: 2,
    label: this.$translate.instant('reportsPage.threeMonths'),
    description: this.$translate.instant('reportsPage.threeMonths2'),
    min: this.TWELVE_WEEKS,
    max: this.YEAR,
  };
  public CUSTOM_FILTER: ITimespan = {
    value: 'custom',
    label: this.$translate.instant('reportsPage.custom'),
    description: this.$translate.instant('reportsPage.custom2'),
    min: 1,
    max: this.YEAR,
  };
  public timeFilter: Array<ITimespan> = [this.WEEK_FILTER, this.MONTH_FILTER, this.THREE_MONTH_FILTER];
  public altTimeFilter: Array<ITimespan> = [this.WEEK_FILTER, this.MONTH_FILTER, this.THREE_MONTH_FILTER, this.CUSTOM_FILTER];

  // active user line graph filterArray
  public ACTIVE_FILTER_ONE: IDropdownBase = {
    value: 0,
    label: this.$translate.instant('activeUsers.allUsers'),
  };
  public ACTIVE_FILTER_TWO: IDropdownBase = {
    value: 1,
    label: this.$translate.instant('activeUsers.activeUsers'),
  };
  public activeFilter: Array<IDropdownBase> = [this.ACTIVE_FILTER_ONE, this.ACTIVE_FILTER_TWO];

  // media graph filter
  public MEDIA_FILTER_ONE: IDropdownBase = {
    value: 0,
    label: this.$translate.instant('reportsPage.allCalls'),
  };
  public MEDIA_FILTER_TWO: IDropdownBase = {
    value: 1,
    label: this.$translate.instant('reportsPage.audioCalls'),
  };
  public MEDIA_FILTER_THREE: IDropdownBase = {
    value: 2,
    label: this.$translate.instant('reportsPage.videoCalls'),
  };
  public mediaFilter: Array<IDropdownBase> = [this.MEDIA_FILTER_ONE, this.MEDIA_FILTER_TWO, this.MEDIA_FILTER_THREE];
}

angular.module('Core')
  .service('ReportConstants', ReportConstants);
