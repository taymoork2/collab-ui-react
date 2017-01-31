import {
  IDropdownBase,
  IFilterObject,
  ITimespan,
} from '../partnerReportInterfaces';

export class ReportConstants {
  public readonly ABORT: string = 'ABORT';

  // Numerical Constants
  public readonly DAYS: number = 6;
  public readonly FIXED: number = 2;
  public readonly MONTHS: number = 2;
  public readonly PERCENTAGE_MULTIPLIER: number = 100;
  public readonly WEEKS: number = 3;
  public readonly YEAR: number = 51;
  public readonly FOUR_WEEKS: number = 48;
  public readonly TWELVE_WEEKS: number = 40;
  public readonly TWENTY_FOUR_WEEKS: number = 28;

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
    private $translate: ng.translate.ITranslateService,
  ) {}

  get WEEK_FILTER(): ITimespan {
    return {
      value: 0,
      label: this.$translate.instant('reportsPage.week'),
      description: this.$translate.instant('reportsPage.week2'),
      min: 0,
      max: this.DAYS,
    };
  }
  get MONTH_FILTER(): ITimespan {
    return {
      value: 1,
      label: this.$translate.instant('reportsPage.month'),
      description: this.$translate.instant('reportsPage.month2'),
      min: this.FOUR_WEEKS,
      max: this.YEAR,
    };
  }
  get THREE_MONTH_FILTER(): ITimespan {
    return {
      value: 2,
      label: this.$translate.instant('reportsPage.threeMonths'),
      description: this.$translate.instant('reportsPage.threeMonths2'),
      min: this.TWELVE_WEEKS,
      max: this.YEAR,
    };
  }
  get SIX_MONTH_FILTER(): ITimespan {
    return {
      value: 3,
      label: this.$translate.instant('reportsPage.sixMonths'),
      description: this.$translate.instant('reportsPage.sixMonths2'),
      min: this.TWENTY_FOUR_WEEKS,
      max: this.YEAR,
    };
  }
  get YEAR_FILTER(): ITimespan {
    return {
      value: 4,
      label: this.$translate.instant('reportsPage.year'),
      description: this.$translate.instant('reportsPage.year2'),
      min: 0,
      max: this.YEAR,
    };
  }
  get CUSTOM_FILTER(): ITimespan {
    return {
      value: 'custom',
      label: this.$translate.instant('reportsPage.custom'),
      description: this.$translate.instant('reportsPage.custom2'),
      min: 0,
      max: this.YEAR,
    };
  }
  get TIME_FILTER(): Array<ITimespan> {
    return [this.WEEK_FILTER, this.MONTH_FILTER, this.THREE_MONTH_FILTER];
  }
  get ALT_TIME_FILTER(): Array<ITimespan> {
    return [this.WEEK_FILTER, this.MONTH_FILTER, this.THREE_MONTH_FILTER, this.SIX_MONTH_FILTER, this.YEAR_FILTER, this.CUSTOM_FILTER];
  }

  // active user line graph filterArray
  get ACTIVE_FILTER_ONE(): IDropdownBase {
    return {
      value: 0,
      label: this.$translate.instant('activeUsers.allUsers'),
    };
  }
  get ACTIVE_FILTER_TWO(): IDropdownBase {
    return {
      value: 1,
      label: this.$translate.instant('activeUsers.activeUsers'),
    };
  }
  get ACTIVE_FILTER(): Array<IDropdownBase> {
    return [this.ACTIVE_FILTER_ONE, this.ACTIVE_FILTER_TWO];
  }

  // media graph filter
  get MEDIA_FILTER_ONE(): IDropdownBase {
    return {
      value: 0,
      label: this.$translate.instant('reportsPage.allCalls'),
    };
  }
  get MEDIA_FILTER_TWO(): IDropdownBase {
    return {
      value: 1,
      label: this.$translate.instant('reportsPage.audioCalls'),
    };
  }
  get MEDIA_FILTER_THREE(): IDropdownBase {
    return {
      value: 2,
      label: this.$translate.instant('reportsPage.videoCalls'),
    };
  }
  get MEDIA_FILTER(): Array<IDropdownBase> {
    return [this.MEDIA_FILTER_ONE, this.MEDIA_FILTER_TWO, this.MEDIA_FILTER_THREE];
  }

  // Registered Endpoint filter default
  get DEFAULT_ENDPOINT(): IDropdownBase {
    return {
      value: 0,
      label: this.$translate.instant('registeredEndpoints.allDevices'),
    };
  }
}

angular.module('Core')
  .service('ReportConstants', ReportConstants);
