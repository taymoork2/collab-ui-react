import './_search.scss';
import { SearchService } from './searchService';
import { Notification } from 'modules/core/notifications';

class Meetingdetails implements ng.IComponentController {

  public data: Object;
  public dataSet: Object;
  public overview: Object;
  public lineColor: Object;
  public circleColor: Object;
  public featAndconn: Object;
  public conferenceID: string;
  public loading: boolean = true;

  /* @ngInject */
  public constructor(
    private Notification: Notification,
    private SearchService: SearchService,
    private $stateParams: ng.ui.IStateParamsService,
  ) {
    this.overview = this.SearchService.getStorage('webexOneMeeting.overview');
    this.featAndconn = this.SearchService.getStorage('webexOneMeeting.featAndconn');
    this.conferenceID = _.get(this.$stateParams, 'cid');
  }

  public $onInit() {
    this.getParticipants();
  }

  private getParticipants() {
    this.SearchService.getParticipants(this.conferenceID)
      .then((res) => {
        const wom = this.SearchService.getStorage('webexOneMeeting');
        const timeZone = this.SearchService.getStorage('timeZone');
        _.forEach(res, (item) => {
          item.browser_ = this.SearchService.getBrowser(_.parseInt(item.browser));
          item.platform_ = this.SearchService.getPlartform(_.parseInt(item.platform));
        });
        this.dataSet = { startTime: _.get(wom, 'startTime'), endTime: _.get(wom, 'endTime'), lines: res, offset: this.SearchService.getOffset(timeZone) };

        this.loading = false;
        this.getJoinMeetingTime();
        this.getJoinMeetingQuality();
      })
      .catch((err) => {
        this.Notification.errorResponse(err, 'errors.statusError', { status: err.status });
        this.loading = true;
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
}

export class MeetingdetailsComponent implements ng.IComponentOptions {
  public controller = Meetingdetails;
  public template = require('modules/core/customerReports/webexReports/diagnostic/tabMeetingdetails.html');
}
