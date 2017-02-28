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
  ISharedMeetingCSV,
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
  ) {
    this.$timeout((): void => {
      this.showReport();
    });
  }

  // Chart Controls
  public siteUrl: string;
  private chart: any;
  private state: string;

  // CSV Download
  public csvDownload: boolean = false;
  public csvHref: string | undefined;
  public csvFilename: string | undefined;
  public csvError: boolean = false;

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

  public isSet(): boolean {
    return this.state === this.ReportConstants.SET;
  }

  public isDownloadReady(): boolean {
    return (!this.csvDownload || !_.isUndefined(this.csvHref)) && !this.csvError;
  }

  public updateReport(): void {
    this.csvDownload = false;
    this.csvHref = undefined;
    this.csvFilename = undefined;
    this.csvError = false;
    this.showReport();
  }

  public dismissModal(): void {
    this.SharedMeetingsReportService.dismissModal();
  }

  private showReport(): void {
    this.setDummyData();
    this.SharedMeetingsReportService.getMaxConcurrentMeetingsData(this.siteUrl, this.getMonth(0), this.getMonth(this.timeSelected.value))
      .then((response: any): void => {
        let data: any = _.get(response, 'data', undefined);
        let sharedMeetingData: Array<ISharedMeetingData> = this.compileSharedMeetingData(data);

        this.state = this.ReportConstants.EMPTY;
        if (sharedMeetingData.length > 0) {
          this.chart = this.SharedMeetingsReportService.setChartData(sharedMeetingData, this.chart);
          this.state = this.ReportConstants.SET;
          this.getDetailedReport();
        }
        if (_.isUndefined(this.exportDropdown)) {
          this.exportDropdown = this.CommonReportService.createExportMenu(this.chart);
        }
      })
      .catch((error: any) => {
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

  private getDetailedReport(): void {
    this.SharedMeetingsReportService.getDetailedReportData(this.siteUrl, this.getMonth(0), this.getMonth(this.timeSelected.value))
      .then((response: any): void => {
        let data: Array<ISharedMeetingCSV> = _.get(response, 'data.ConcurrentMeetingsDetail', []);
        if (data.length > 0) {
          data.unshift({
            MeetingTopic: this.$translate.instant('sharedMeetingReports.csvMeetingTopic'),
            StartTime: this.$translate.instant('sharedMeetingReports.csvStartTime'),
            EndTime: this.$translate.instant('sharedMeetingReports.csvEndTime'),
            ConfId: this.$translate.instant('sharedMeetingReports.csvConfId'),
            Duration: this.$translate.instant('sharedMeetingReports.csvDuration'),
            MeetingType: this.$translate.instant('sharedMeetingReports.csvMeetingType'),
            HostId: this.$translate.instant('sharedMeetingReports.csvHostId'),
            HostName: this.$translate.instant('sharedMeetingReports.csvHostName'),
          });

          let csvData: string = ($ as any).csv.fromObjects(data, { headers: false });
          let url: string | undefined = this.SharedMeetingsReportService.getDownloadCSV(csvData);
          if (url) {
            this.csvHref = url;
            this.csvFilename = this.SharedMeetingsReportService.FILENAME;
          } else {
            // IE download option since IE won't download the created url
            this.csvDownload = true;
          }
        } else {
          this.Notification.error('sharedMeetingReports.errorLoadingSharedMeetingDetails');
          this.csvError = true;
        }
      })
      .catch((error: any): void => {
        this.Notification.errorWithTrackingId(error, 'sharedMeetingReports.errorLoadingSharedMeetingDetails');
        this.csvError = true;
      });
  }

  public csvDownloadForInternetExplorer(): void {
    this.SharedMeetingsReportService.downloadInternetExplorer();
  }
}

angular.module('Core')
  .component('sharedMeetingReport', {
    templateUrl: 'modules/core/myCompany/mySubscriptions/sharedMeetings/sharedMeetingsReport.tpl.html',
    controller: SharedMeetingsReportCtrl,
    bindings: {
      siteUrl: '@',
    },
  });
