import './_search.scss';
import * as moment from 'moment';
import { SearchService } from './searchService';
import { Notification } from 'modules/core/notifications';

class WebexReportsMore implements ng.IComponentController {

  public data: any;
  public dataSet: any;
  public loading = true;
  public lineColor: any;
  public circleColor: any;
  public conferenceID: Number;
  public loadingMeetingline = false;

  /* @ngInject */
  public constructor(
    private Notification: Notification,
    private $state: ng.ui.IStateService,
    private SearchService: SearchService,
    private $translate: ng.translate.ITranslateService,
  ) {
    const wm: any = this.SearchService.getStorage('webexMeeting');
    this.conferenceID = wm.conferenceID;
  }

  public $onInit() {
    this.getMeetingDetail();
    this.$state.current.data.displayName = this.$translate.instant('webexReports.session');
  }

  private getMeetingDetail() {
    this.SearchService.getMeetingDetail(this.conferenceID)
      .then((res) => {
        this.loading = false;
        const data: any  = res;
        data.overview.duration = this.getDuration(data.overview.duration);
        data.overview.status_ = this.SearchService.getStatus(data.overview.status);
        data.overview.startTime_ = moment(data.overview.startTime).utc().format('hh:mm');
        data.overview.startDate = moment(data.overview.startTime).utc().format('MMMM Do, YYYY');
        data.overview.endTime_ = data.overview.endTime ? moment(data.overview.endTime).utc().format('hh:mm') : '';
        data.overview.endDate = data.overview.endTime ? moment(data.overview.endTime).utc().format('MMMM Do, YYYY') : '';
        _.forEach(data.sessions, (item) => {
          item.duration = this.getDuration(item.duration);
          item.sessionType = this.sessionType(item.sessionType);
          item.startTime = moment(item.startTime).utc().format('h:mm:ss A');
          item.endTime = item.endTime ? moment(item.endTime).utc().format('h:mm:ss A') : '';
        });
        this.data = data;
        this.getParticipants();
      });
  }

  private getParticipants() {
    this.SearchService.getParticipents(this.conferenceID)
      .then((res) => {
        this.loadingMeetingline = true;
        this.dataSet = { overview: this.data.overview, lines: res };
        this.getJoinMeetingTime();
        this.getJoinMeetingQuality();
      })
      .catch((err) => {
        this.Notification.errorResponse(err, 'errors.statusError', { status: err.status });
        this.loadingMeetingline = false;
      });
  }

  private getJoinMeetingTime() {
    this.SearchService.getJoinMeetingTime(this.conferenceID)
      .then((res) => {
        this.circleColor = res;
      });
  }

  private getJoinMeetingQuality() {
    this.SearchService.getJoinMeetingQuality(this.conferenceID)
      .then((res) => {
        this.lineColor = res;
      });
  }

  private getDuration(value) {
    return moment.duration(value * 1000).humanize();
  }

  private sessionType(sessionType) {
    let sessionType_ = '';
    sessionType_ = this.$translate.instant('webexReports.sessionType.sessionType_' + sessionType);
    sessionType_ =  sessionType_ ? sessionType_ : this.$translate.instant('webexReports.sessionType.sessionType_10');
    return sessionType_;
  }
}

export class CustWebexReportsMoreComponent implements ng.IComponentOptions {
  public controller = WebexReportsMore;
  public templateUrl = 'modules/core/customerReports/webexReports/search/webexReportsMore.html';
}
