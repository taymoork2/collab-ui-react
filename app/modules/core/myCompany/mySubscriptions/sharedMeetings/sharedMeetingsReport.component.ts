import './sharedMeetings-reports.scss';
import { IExportMenu, IExportDropdown } from '../../../partnerReports/partnerReportInterfaces';
import { ReportPrintService } from '../../../partnerReports/commonReportServices/reportPrint.service';
import { ReportConstants } from '../../../partnerReports/commonReportServices/reportConstants.service';
import { SharedMeetingsReportService } from './sharedMeetingsReport.service';
import { Notification } from '../../../notifications/notification.service';

import {
  IMeetingData,
  ISharedMeetingTimeFilter,
  ISharedMeetingData,
  ISharedMeetingCSV,
  IMaxConcurrentDataCSV,
  IMonthlyMaxConcurrentData,
} from './sharedMeetingsReport.interfaces';

class SharedMeetingsReportCtrl {
  private readonly ONE_MONTH: number = 1;
  private readonly THREE_MONTHS: number = 2;
  private readonly SIX_MONTHS: number = 5;
  private readonly DATE_FORMAT: string = 'MMM \'YY';
  private maxConcurrentData: IMonthlyMaxConcurrentData;
  /* @ngInject */
  constructor(
    private $timeout: ng.ITimeoutService,
    private $translate: ng.translate.ITranslateService,
    private ReportPrintService: ReportPrintService,
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
  public csvHref?: string;
  public csvHref2?: string;
  public csvFilename?: string;
  public csvFilename2?: string;
  public csvError: boolean = false;

  // Timefilter controls
  public timeFilter: ISharedMeetingTimeFilter[] = [{
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
  public exportDropdown: IExportDropdown;
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
    return (this.csvDownload || this.csvHref !== undefined) && !this.csvError;
  }

  public updateReport(): void {
    this.csvDownload = false;
    this.csvHref = undefined;
    this.csvHref2 = undefined;
    this.csvFilename = undefined;
    this.csvFilename2 = undefined;
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
        const data: any = _.get(response, 'data', undefined);
        const sharedMeetingData: ISharedMeetingData[] = this.compileSharedMeetingData(data);
        this.maxConcurrentData = data;
        this.state = this.ReportConstants.EMPTY;
        if (sharedMeetingData.length > 0) {
          this.chart = this.SharedMeetingsReportService.setChartData(sharedMeetingData, this.chart, this.timeSelected);
          this.state = this.ReportConstants.SET;
          this.getDetailedReport();
        }
        if (_.isUndefined(this.exportDropdown)) {
          this.exportDropdown = this.ReportPrintService.createExportMenu(this.chart);
        }
      })
      .catch((error: any) => {
        this.Notification.errorWithTrackingId(error, 'sharedMeetingReports.errorLoadingSharedMeetingData');
        this.state = this.ReportConstants.EMPTY;
      });
  }

  private compileSharedMeetingData(data: any): ISharedMeetingData[] {
    const max: number = _.get(data, 'BucketLengthInMins', 0);
    const meetingArray: IMeetingData[] = _.get(data, 'MaxConcurrentMeetings', []);
    let emptyArray: boolean = true;
    const returnArray: ISharedMeetingData[] = this.getBaseGraph(max);

    _.forEach(meetingArray, (item: any): void => {
      const date: string = _.get(item, 'TimeBucketStart', '');
      const modifiedDate: string = moment(date.substring(0, 4) + '-' + date.substring(4, 6)).format(this.DATE_FORMAT);
      const meetings: number = _.get(item, 'NumOfMtgs', 0);
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

  private getBaseGraph(max: number): ISharedMeetingData[] {
    const returnArray: ISharedMeetingData[] = [];

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
    const dummyData: ISharedMeetingData[] = [];

    for (let i = this.timeSelected.value; i >= 0; i--) {
      dummyData.push({
        date: moment().subtract(i, this.ReportConstants.MONTH).format(this.DATE_FORMAT),
        maxMeetings: 15,
        meetings: i * 2,
        balloon: false,
      });
    }

    this.chart = this.SharedMeetingsReportService.setChartData(dummyData, this.chart, this.timeSelected);
  }
  private dateFix(dateString: string , optionalMins: number = 0): string {
    return moment(dateString, 'YYYYMM').add(optionalMins, 'm').format('YYYY/MM/DD HH:mm');
  }

  private makeCSV(csvLink1: string | undefined, csvLink2: string | undefined): void {
    if (csvLink1 && csvLink2) {
      this.csvHref = csvLink1;
      this.csvHref2 = csvLink2;
      this.csvFilename = this.SharedMeetingsReportService.FILENAMES[0];
      this.csvFilename2 = this.SharedMeetingsReportService.FILENAMES[1];
    } else {
      // IE download option since IE won't download the created url
      this.csvDownload = true;
    }
  }
  private getDetailedReport(): void {
    this.SharedMeetingsReportService.getDetailedReportData(this.siteUrl, this.getMonth(0), this.getMonth(this.timeSelected.value))
      .then((response): void => {
        const siteName: string = response.data.SiteName;
        const data: ISharedMeetingCSV[] = _.get(response, 'data.ConcurrentMeetingsDetail', []);
        if (data.length > 0) {
          data.unshift({
            MeetingTopic: this.$translate.instant('sharedMeetingReports.csvMeetingTopic'),
            StartTime: this.$translate.instant('sharedMeetingReports.csvStartTime'),
            EndTime: this.$translate.instant('sharedMeetingReports.csvEndTime'),
            ConfId: this.$translate.instant('sharedMeetingReports.csvConfId'),
            HostName: this.$translate.instant('sharedMeetingReports.csvUserName'),
            SiteName: this.$translate.instant('sharedMeetingReports.csvSiteName'),
          });

          const reformattedData: any[] = [];
          reformattedData.push(data[0]);
          data.shift();
          _.forEach(data, (meeting) => {
            reformattedData.push({
              MeetingTopic: meeting.MeetingTopic,
              StartTime: meeting.StartTime,
              EndTime: meeting.EndTime,
              ConfId:  meeting.ConfId,
              HostName: meeting.HostName,
              SiteName: siteName,
            });
          });
          const concurrentData: IMaxConcurrentDataCSV[] = [{
            SiteName : reformattedData[0].SiteName,
            Month : this.$translate.instant('sharedMeetingReports.csvMonth'),
            From : this.$translate.instant('sharedMeetingReports.csvFrom'),
            To: this.$translate.instant('sharedMeetingReports.csvTo'),
            ConcurrentMeetingsPeak: this.$translate.instant('sharedMeetingReports.csvConcurrentMeetingsPeak'),
          }];

          if (this.maxConcurrentData) {
            _.forEach(this.maxConcurrentData.MaxConcurrentMeetings, (meeting) => {
              const startMonthYear = moment(meeting.TimeBucketStart, 'YYYYMM').format('MMM-YY');
              concurrentData.push({
                SiteName: siteName,
                Month: startMonthYear,
                From: this.dateFix(meeting.TimeBucketStart),
                To: this.dateFix(meeting.TimeBucketStart , this.maxConcurrentData.BucketLengthInMins),
                ConcurrentMeetingsPeak: String(meeting.NumOfMtgs),
              });
            });
          }

          const csvData: string = ($ as any).csv.fromObjects(reformattedData, { headers: false });
          const csvMaxConcurrentData = ($ as any).csv.fromObjects(concurrentData, { headers: false });

          this.makeCSV(
            this.SharedMeetingsReportService.getDownloadCSV(csvData),
            this.SharedMeetingsReportService.getDownloadCSV(csvMaxConcurrentData),
            );

        } else {
          this.Notification.error('sharedMeetingReports.errorLoadingSharedMeetingDetails');
          this.csvError = true;
        }
      })
      .catch((error): void => {
        this.Notification.errorWithTrackingId(error, 'sharedMeetingReports.errorLoadingSharedMeetingDetails');
        this.csvError = true;
      });
  }

  public csvDownloadForInternetExplorer(): void {
    this.SharedMeetingsReportService.downloadInternetExplorer();
  }
}

export class SharedMeetingComponent implements ng.IComponentOptions {
  public template = require('modules/core/myCompany/mySubscriptions/sharedMeetings/sharedMeetingsReport.tpl.html');
  public controller = SharedMeetingsReportCtrl;
  public bindings = {
    siteUrl: '@',
  };
}
