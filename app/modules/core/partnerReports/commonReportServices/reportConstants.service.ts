import {
  IDropdownBase,
  IFilterObject,
  ITimespan,
} from '../partnerReportInterfaces';

export class ReportConstants {
  public readonly ABORT = 'ABORT';

  // Media Quality and Registered Endpoint type classes
  public readonly CUSTOMER_DATA = 'customer-data';
  public readonly GOOD = 'good';
  public readonly HORIZONTAL_CENTER = 'horizontal-center';
  public readonly FAIR = 'fair';
  public readonly POOR = 'poor';
  public readonly POSITIVE = 'positive';
  public readonly NEGATIVE = 'negative';

  // Numerical Constants
  public readonly DAYS = 6;
  public readonly FIXED = 2;
  public readonly MONTHS = 2;
  public readonly PERCENTAGE_MULTIPLIER = 100;
  public readonly WEEKS = 3;
  public readonly YEAR = 51;
  public readonly FOUR_WEEKS = 48;
  public readonly TWELVE_WEEKS = 40;
  public readonly TWENTY_FOUR_WEEKS = 28;

  // moment formatting helpers
  public readonly DAY_FORMAT = 'MMM DD';
  public readonly MONTH_FORMAT = 'MMMM';
  public readonly TIMEZONE = 'Etc/GMT';
  public readonly DAY = 'day';
  public readonly WEEK = 'week';
  public readonly MONTH = 'month';

  // Refresh/Set/Empty tracking
  public readonly REFRESH = 'refresh';
  public readonly SET = 'set';
  public readonly EMPTY = 'empty';
  public readonly ERROR = 'error';

  // Chart Types
  public readonly BARCHART = 'barchart';
  public readonly DONUT = 'donut';
  public readonly TABLE = 'table';
  public readonly UNDEF = 'undefined';

  // Report visibility
  public readonly ALL = 'all';
  public readonly ENGAGEMENT = 'engagement';
  public readonly QUALITY = 'quality';
  public readonly DETAILS = 'details';

  // Report Filtering All/Engagement/quality
  public filterArray: IFilterObject[] = [{
    id: 'allReports',
    label: 'common.all',
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
    private FeatureToggleService,
  ) {}

  get FILTER_ARRAY(): IFilterObject[] {
    this.FeatureToggleService.supports(this.FeatureToggleService.features.hI802)
      .then(supports => {
        if (supports) {
          if (this.filterArray.length < 4) {
            this.filterArray.push({ id: 'records', label: 'reportsPage.details', selected: false, toggle: undefined });
          }
        }
      });
    return this.filterArray;
  }

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
  get TIME_FILTER(): ITimespan[] {
    return [this.WEEK_FILTER, this.MONTH_FILTER, this.THREE_MONTH_FILTER];
  }
  get ALT_TIME_FILTER(): ITimespan[] {
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
  get ACTIVE_FILTER(): IDropdownBase[] {
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
  get MEDIA_FILTER(): IDropdownBase[] {
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
