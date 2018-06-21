import { IMeeting, IMeetingDetail, IServerTime, ISession } from './partner-search.interfaces';
import { SearchStorage } from './partner-meeting.enum';
import { SERVICE_TYPE } from 'modules/core/customerReports/webexReports/diagnostic/meeting-export.component';
import { Notification } from 'modules/core/notifications/notification.service';
import { CustomerSearchService } from './customer-search.service';
import { PartnerSearchService } from './partner-search.service';
import { WebexReportsUtilService } from './webex-reports-util.service';

export enum SessionTypes {
  SCREEN_SHARE = '4',
  RECORDING = '50',
}

enum MeetingInfoStatus {
  GOING = 1,
  END = 2,
}

enum ValueTypes {
  YES = 'yes',
  NO = 'no',
  APP_SHARE = 'appShare',
  NBR2 = 'nbr2',
}

interface ITab {
  state: string;
  title: string;
}

class DgcPartnerTab implements ng.IComponentController {
  public tabs: ITab[];
  public data: object;
  public details: IMeetingDetail;
  public overview: IMeetingDetail;
  public loading = true;
  public MEETING_INFO_STATUS = MeetingInfoStatus;
  public BACK_STATE = '';
  private timeZone: string;
  private conferenceID: string;
  public isSupportExport = false;
  public SERVICE_TYPE = SERVICE_TYPE;
  private dataService: (PartnerSearchService | CustomerSearchService);
  private isPartnerRole = true;

  /* @ngInject */
  public constructor(
    private $stateParams: ng.ui.IStateParamsService,
    private $translate: ng.translate.ITranslateService,
    private Notification: Notification,
    private CustomerSearchService: CustomerSearchService,
    private FeatureToggleService,
    private PartnerSearchService: PartnerSearchService,
    private WebexReportsUtilService: WebexReportsUtilService,
  ) {
    this.conferenceID = _.get(this.$stateParams, 'cid');
    this.timeZone = this.WebexReportsUtilService.getStorage(SearchStorage.TIME_ZONE);

    this.isPartnerRole = this.WebexReportsUtilService.getStorage(SearchStorage.PARTNER_ROLE);
    this.dataService = (this.isPartnerRole) ? this.PartnerSearchService : this.CustomerSearchService;
  }

  public $onInit(): void {
    if (this.isPartnerRole) {
      this.initPartnerRole();
    } else {
      this.initCustomerRole();
    }
    this.getMeetingDetail();
  }

  private initCustomerRole(): void {
    this.FeatureToggleService.diagnosticF8193UX3GetStatus()
      .then((isSupport: boolean) => {
        if (isSupport) {
          this.BACK_STATE = 'support.meeting';
        } else {
          this.BACK_STATE = 'reports.webex-metrics.diagnostics';
        }
      });
    this.FeatureToggleService.diagnosticF8194MeetingDetailsGetStatus()
      .then((isSupport: boolean) => {
        this.isSupportExport = isSupport;
      });
    this.tabs = [
      {
        state: `dgc.tab.meetingdetail({cid: '${this.conferenceID}'})`,
        title: this.$translate.instant(`webexReports.meetingDetails`),
      },
      {
        state: `dgc.tab.participants({cid: '${this.conferenceID}'})`,
        title: this.$translate.instant(`webexReports.participants`),
      },
    ];
  }

  private initPartnerRole(): void {
    this.FeatureToggleService.diagnosticPartnerF8193TroubleshootingGetStatus()
      .then((isSupport: boolean) => {
        if (isSupport) {
          this.BACK_STATE = 'partnertroubleshooting.diagnostics';
        } else {
          this.BACK_STATE = 'partnerreports.tab.webexreports.diagnostics';
        }
      });
    this.FeatureToggleService.diagnosticPartnerF8194MeetingDetailsGetStatus()
      .then((isSupport: boolean) => {
        this.isSupportExport = isSupport;
      });
    this.tabs = [
      {
        state: `partnerreports.dgc.meetingdetail({cid: '${this.conferenceID}'})`,
        title: this.$translate.instant(`webexReports.meetingDetails`),
      },
      {
        state: `partnerreports.dgc.participants({cid: '${this.conferenceID}'})`,
        title: this.$translate.instant(`webexReports.participants`),
      },
    ];
  }

  private getMeetingDetail(): void {
    this.dataService.getMeetingDetail(this.conferenceID)
      .then((res: IMeeting) => {
        const mbi = res.meetingBasicInfo;
        const details = this.mkDetails(mbi);
        const overview = this.mkOverview(mbi);
        const { sessions, screenShareDuration, recordingDuration } = this.mkSession(res.sessions);
        const features = this.parseFeatures(overview, res.features, screenShareDuration);
        const connections = this.parseConnection(overview, res.connection, recordingDuration);
        const featAndConn = _.concat(sessions, features, connections);
        this.data = _.assignIn({}, {
          overview,
          featAndConn,
          startTime: mbi.startTime,
          endTime: mbi.status ===  MeetingInfoStatus.END ? mbi.endTime : undefined,
        });
        this.WebexReportsUtilService.setStorage(SearchStorage.WEBEX_ONE_MEETING, this.data);
        this.details = details;

        if (mbi.status === MeetingInfoStatus.GOING) {
          return this.dataService.getServerTime()
            .then((res: IServerTime) => {
              mbi.endTime = _.get(res, 'dateLong');
              this.WebexReportsUtilService.setStorage(SearchStorage.WEBEX_MEETING_ENDTIME, mbi.endTime);
              details.duration_ = this.WebexReportsUtilService.toMinOrSec(mbi.endTime - mbi.startTime);
            });
        } else {
          details.duration_ = this.WebexReportsUtilService.toMinOrSec(mbi.duration * 1000);
        }
      }).catch((response) => {
        this.Notification.errorWithTrackingId(response);
      }).finally(() => {
        this.loading = false;
      });
  }

  private parseFeatures(overview: IMeetingDetail, features: ISession[], sharing: number): ISession[] {
    const featureResults: ISession[] = [];
    _.forEach(features, (val: string, key: string) => {
      const val_ = val ? ValueTypes.YES : ValueTypes.NO;
      if (key === ValueTypes.APP_SHARE) {
        overview.screenShare = sharing;
        overview.screenShare_ = this.formatDuration(sharing);
      }
      featureResults.push({
        key: this.$translate.instant(`webexReports.meetingFeatures.${key}`),
        val: this.$translate.instant(`common.${val_}`),
        class: val_ === ValueTypes.YES,
      });
    });
    return featureResults;
  }

  private parseConnection(overview: IMeetingDetail, connection: ISession[], recording: number): ISession[] {
    const connectionResult: ISession[] = [];
    _.forEach(connection, (val: string, key: string) => {
      if (key === ValueTypes.NBR2) {
        overview.recording = recording;
        overview.recording_ = this.formatDuration(recording);
      }
      return {
        key: this.$translate.instant(`webexReports.connectionFields.${key}`),
        val: this.$translate.instant(`common.${val}`),
        class: val === ValueTypes.YES,
      };
    });
    return connectionResult;
  }

  private mkDetails(meeting: IMeetingDetail): IMeetingDetail {
    return _.assign({}, meeting, {
      status_: this.WebexReportsUtilService.getMeetingStatus(meeting.status),
      startTime_: this.timestampToDate(meeting.startTime, 'h:mm A'),
      startDate: this.timestampToDate(meeting.startTime, 'YYYY-MM-DD'),
      endTime_: meeting.endTime ? this.timestampToDate(meeting.endTime, 'h:mm A') : '',
      endDate: meeting.endTime ? this.timestampToDate(meeting.endTime, 'YYYY-MM-DD') : '',
    });
  }

  private mkOverview(meeting: IMeetingDetail): IMeetingDetail {
    return _.assignIn({}, meeting, {
      duration_: moment.duration(meeting.duration * 1000).humanize(),
      endTime_: this.WebexReportsUtilService.dateToTimezoneAdjustedUtc(meeting.endTime),
      startTime_: this.WebexReportsUtilService.dateToTimezoneAdjustedUtc(meeting.startTime),
      createTime_: this.WebexReportsUtilService.dateToTimezoneAdjustedUtc(meeting.createdTime),
    });
  }

  private mkSession(_sessions: ISession[]): {
    sessions: ISession[],
    screenShareDuration: number,
    recordingDuration: number,
  } {
    let screenShareDuration = 0, recordingDuration = 0;
    const sessions = _.map(_sessions, (item: ISession) => {
      if (item.sessionType === SessionTypes.SCREEN_SHARE && item.duration) {
        screenShareDuration += item.duration;
      }
      if (item.sessionType === SessionTypes.RECORDING && item.duration) {
        recordingDuration += item.duration;
      }
      const duration = item.duration ? item.duration : 0;
      return {
        class: true,
        val: `${this.$translate.instant('webexReports.duration')} ${moment.duration(duration * 1000).humanize()}`,
        key: this.$translate.instant(`webexReports.sessionType.sessionType_${item.sessionType}`),
      };
    });
    return {
      sessions,
      screenShareDuration,
      recordingDuration,
    };
  }

  private timestampToDate(timestamp: number, format: string): string {
    const offset = this.WebexReportsUtilService.getTzOffset(this.timeZone);
    return moment(timestamp).utc().utcOffset(offset).format(format);
  }

  private formatDuration(durationSeconds: number): string {
    if (durationSeconds <= 0) {
      return this.$translate.instant('webexReports.notUsed');
    }
    const duration = moment.duration(durationSeconds * 1000);
    const timeComponents: string[] = [];
    const hours = duration.hours();
    const minutes = duration.minutes();
    const seconds = duration.seconds();
    if (hours) {
      timeComponents.push(this.$translate.instant('time.hours', { time: hours }, 'messageformat'));
    }
    if (minutes) {
      timeComponents.push(this.$translate.instant('time.minutes', { time: minutes }, 'messageformat'));
    }
    if (seconds) {
      timeComponents.push(this.$translate.instant('time.seconds', { time: seconds }, 'messageformat'));
    }
    return timeComponents.join(' ');
  }
}

export class DgcPartnerTabComponent implements ng.IComponentOptions {
  public controller = DgcPartnerTab;
  public template = require('modules/core/partnerReports/webexReports/diagnostic/dgc-partner-tab.html');
}
