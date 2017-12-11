import './_search.scss';
import { SearchService } from './searchService';
import { Notification } from 'modules/core/notifications';

class Meetingdetails implements ng.IComponentController {

  public data: any;
  public dataSet: Object;
  public overview: Object;
  public otherPara: Object;
  public lineColor: Object;
  public circleColor: Object;
  public featAndconn: Object;
  public conferenceID: string;
  public loading: boolean = true;

  /* @ngInject */
  public constructor(
    private Notification: Notification,
    private SearchService: SearchService,
    private $timeout: ng.ITimeoutService,
    private $stateParams: ng.ui.IStateParamsService,
  ) {
    this.data = {
      voip: {},
      video: {},
      voipReqtimes: 0,
      videoRetimes: 0,
      currentQos: 'voip',
    };
  }

  public $onInit() {
    this.getEndTime();
    this.overview = this.SearchService.getStorage('webexOneMeeting.overview');
    this.featAndconn = this.SearchService.getStorage('webexOneMeeting.featAndconn');
    this.conferenceID = _.get(this.$stateParams, 'cid');

    this.getParticipants();
  }

  public onChangeQOS(qos) {
    this.loading = true;
    this.data.currentQos = qos;
    this.lineColor = this.data[qos];
    this.otherPara = qos === 'voip' ? this.data.pstn : undefined;
    this.$timeout(() => this.loading = false, 200);
  }

  private getParticipants() {
    this.SearchService.getUniqueParticipants(this.conferenceID)
      .then((res: any) => {
        this.loading = false;
        const timeZone = this.SearchService.getStorage('timeZone');
        const wom = this.SearchService.getStorage('webexOneMeeting');
        const lines = _.map(res, (item) => this.formateLine(_.get(item, 'participants')));
        this.dataSet = { lines: lines, endTime: _.get(wom, 'endTime'), startTime: _.get(wom, 'startTime'), offset: this.SearchService.getOffset(timeZone) };

        const ids = this.getAllIds(lines);
        this.getJoinMeetingTime();
        this.voipQOS(ids);
        this.videoQOS(ids);
        this.pstnQOS(ids);
      })
      .catch((err) => {
        this.loading = true;
        this.Notification.errorResponse(err, 'errors.statusError', { status: err.status });
      });
  }

  private getJoinMeetingTime() {
    this.SearchService.getJoinMeetingTime(this.conferenceID)
      .then( res => this.circleColor = res );
  }

  private voipQOS(ids) {
    this.SearchService.getQOS(this.conferenceID, ids, 'voip-network-qos')
    .then( res => this.getLineCircleData(res, 'voip') );
  }

  private videoQOS(ids) {
    this.SearchService.getQOS(this.conferenceID, ids, 'video-network-qos')
    .then( res => this.getLineCircleData(res, 'video') );
  }

  private pstnQOS(ids) { // TODO, will discuss with backend to optimize the response data.
    this.SearchService.getQOS(this.conferenceID, ids, 'pstn-qos')
    .then((res: any) => {
      const obj = {};
      _.map(res, (item: any, key) => {
        _.forEach(item.items, (item_) => {
          const data = _.cloneDeep(item_);
          const arr_ = data.tahoeQuality;
          _.unset(data, 'tahoeQuality');
          const arr__: any = [];
          _.forEach(arr_, (item__) => {
            const obj__ = _.assignIn({ type: 'PSTN', nodeId: key }, item__, data);
            arr__.push(obj__);
          });
          obj[key] = arr__;
        });
      });
      this.data.pstn = obj;
    });
  }

  private formateLine(lines) {
    const wom = this.SearchService.getStorage('webexOneMeeting');
    return _.forEach(lines, (item) => {
      item.leaveTime = item.leaveTime || _.get(wom, 'endTime');
      item.browser_ = this.SearchService.getBrowser(_.parseInt(item.browser));
      item.platform_ = this.SearchService.getPlartform({ platform: item.platform, sessionType: item.sessionType });
    });
  }

  private getEndTime() {
    const status = this.SearchService.getStorage('webexOneMeeting.overview.status');
    if (status === 1) {
      this.SearchService.getServerTime()
      .then( res => this.SearchService.setStorage('webexOneMeeting.endTime', _.get(res, 'dateLong')));
    }
  }

  private getAllIds(lines) {
    let arr = [];
    _.map(lines, (item: any) => arr = _.concat(arr, item));
    return _.join(_.map(arr, (item) => _.get(item, 'nodeId')));
  }

  private getLineCircleData(res, qosName) { // TODO, will discuss with backend to optimize the response data.
    const obj = {};
    const retryIds: String[] = [];
    _.forEach(res, (item: any, key: string) => {
      if (!item.completed) {
        retryIds.push(key);
      } else {
        _.forEach(item.items, (oneItem) => {
          oneItem.type = _.capitalize(qosName);
        });
        obj[key] = item.items;
      }
    });
    if (_.size(retryIds)) {
      if (this.data[`${qosName}Reqtimes`] > 5) {
        return false;
      }
      this.data[`${qosName}Reqtimes`] += 1;
      const fun = this[`${qosName}QOS`];
      fun(_.join(retryIds));
    }
    _.assignIn(this.data[qosName], obj);
    this.lineColor = _.get(this.data, 'currentQos') === 'video' ? this.data[qosName] : this.lineColor;
  }
}

export class MeetingdetailsComponent implements ng.IComponentOptions {
  public controller = Meetingdetails;
  public template = require('modules/core/customerReports/webexReports/diagnostic/tabMeetingdetails.html');
}
