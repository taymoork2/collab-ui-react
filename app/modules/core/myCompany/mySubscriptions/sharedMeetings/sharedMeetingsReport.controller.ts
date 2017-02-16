import './sharedMeetings-reports.scss';
import { IExportMenu } from '../../../partnerReports/partnerReportInterfaces';
import { CommonReportService } from '../../../partnerReports/commonReportServices/commonReport.service';
import { ReportConstants } from '../../../partnerReports/commonReportServices/reportConstants.service';
import { SharedMeetingsReportService } from './sharedMeetingsReport.service';
import { Notification } from '../../../notifications/notification.service';

import {
  IMeetingData,
  ISharedMeetingTimeFilter,
  ISharedMeetingData,
} from './sharedMeetingsReport.interfaces';

class SharedMeetingsReportCtrl {
  private readonly ONE_MONTH: number = 1;
  private readonly THREE_MONTHS: number = 3;
  private readonly SIX_MONTHS: number = 6;
  private readonly DATE_FORMAT: string = 'MMM \'YY';

  /* @ngInject */
  constructor(
    private $timeout: ng.ITimeoutService,
    private $translate: ng.translate.ITranslateService,
    private CommonReportService: CommonReportService,
    private ReportConstants: ReportConstants,
    private Notification: Notification,
    private SharedMeetingsReportService: SharedMeetingsReportService,
    private siteUrl,
  ) {
    this.$timeout((): void => {
      this.showReport();
    });
  }

  // Chart Controls
  private chart: any;
  private state: string;

  // Timefilter controls
  public timeFilter: Array<ISharedMeetingTimeFilter> = [{
    label: this.$translate.instant('reportsPage.sixMonths'),
    value: this.SIX_MONTHS,
  }, {
    label: this.$translate.instant('reportsPage.threeMonths'),
    value: this.THREE_MONTHS,
  }, {
    label: this.$translate.instant('reportsPage.oneMonth'),
    value: this.ONE_MONTH,
  }];
  public timeSelected: ISharedMeetingTimeFilter = this.timeFilter[0];

  // Export Menu Controls
  public exportDropdown: Array<IExportMenu>;
  public exportMenu: boolean = false;

  public dropdownSelect(menuItem: IExportMenu): void {
    if (menuItem.click) {
      this.toggleExportMenu();
      menuItem.click();
    }
  }

  public toggleExportMenu(): void {
    this.exportMenu = !this.exportMenu;
  }

  public isRefresh(): boolean {
    return this.state === this.ReportConstants.REFRESH;
  }

  public isEmpty(): boolean {
    return this.state === this.ReportConstants.EMPTY;
  }

  public showReport() {
    this.setDummyData();
    this.SharedMeetingsReportService.getMaxConcurrentMeetingsData(this.siteUrl, this.getMonth(0), this.getMonth(this.timeSelected.value))
      .then((response: any): void => {
        let data: any = _.get(response, 'data', undefined);
        let sharedMeetingData: Array<ISharedMeetingData> = this.compileSharedMeetingData(data);

        this.state = this.ReportConstants.EMPTY;
        if (sharedMeetingData.length > 0) {
          this.chart = this.SharedMeetingsReportService.setChartData(sharedMeetingData, this.chart);
          this.state = this.ReportConstants.SET;
        }
        if (_.isUndefined(this.exportDropdown)) {
          this.exportDropdown = this.CommonReportService.createExportMenu(this.chart);
        }
      })
      .catch((error) => {
        this.Notification.errorWithTrackingId(error, 'sharedMeetingReports.errorLoadingSharedMeetingData');
        this.state = this.ReportConstants.EMPTY;
      });
  }

  private compileSharedMeetingData(data: any): Array<ISharedMeetingData> {
    let max: number = _.get(data, 'BucketLengthInMins', 0);
    let meetingArray: Array<IMeetingData> = _.get(data, 'MaxConcurrentMeetings', []);
    let emptyArray: boolean = true;
    let returnArray: Array<ISharedMeetingData> = this.getBaseGraph(max);

    _.forEach(meetingArray, (item: any): void => {
      let date: string = _.get(item, 'TimeBucketStart', '');
      let modifiedDate: string = moment(date.substring(0, 4) + '-' + date.substring(4, 6)).format(this.DATE_FORMAT);
      let meetings: number = _.get(item, 'NumOfMtgs', 0);
      if (meetings > 0) {
        emptyArray = false;
      }

      _.forEach(returnArray, (returnItem: ISharedMeetingData): void => {
        if (returnItem.date === modifiedDate) {
          returnItem.meetings = meetings;
        }
      });
    });

    if (!emptyArray) {
      return returnArray;
    } else {
      return [];
    }
  }

  private getMonth(months: number): string {
    return moment().subtract(months, this.ReportConstants.MONTH).format('YYYYMM');
  }

  private getBaseGraph(max: number): Array<ISharedMeetingData> {
    let returnArray: Array<ISharedMeetingData> = [];

    for (let i = this.timeSelected.value; i >= 0; i--) {
      returnArray.push({
        date: moment().subtract(i, this.ReportConstants.MONTH).format(this.DATE_FORMAT),
        maxMeetings: max,
        meetings: 0,
        balloon: true,
      });
    }

    return returnArray;
  }

  private setDummyData(): void {
    this.state = this.ReportConstants.REFRESH;
    let dummyData: Array<ISharedMeetingData> = [];

    for (let i = this.timeSelected.value; i >= 0; i--) {
      dummyData.push({
        date: moment().subtract(i, this.ReportConstants.MONTH).format(this.DATE_FORMAT),
        maxMeetings: 15,
        meetings: i * 2,
        balloon: false,
      });
    }

    this.chart = this.SharedMeetingsReportService.setChartData(dummyData, this.chart);
  }
}

angular
  .module('Core')
  .controller('SharedMeetingsReportCtrl', SharedMeetingsReportCtrl);
