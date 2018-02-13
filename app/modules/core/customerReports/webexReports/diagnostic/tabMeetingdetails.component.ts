import './_search.scss';
import { SearchService } from './searchService';
import { Notification } from 'modules/core/notifications';

class Meetingdetails implements ng.IComponentController {

  public data: any;
  public dataSet: Object;
  public overview: Object;
  public cmrData: Object;
  public pstnData: Object;
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
    private $q: ng.IQService,
  ) {
    this.data = {
      voip: {},
      video: {},
      pstn: {},
      cmr: {},
      voipReqtimes: 0,
      videoReqtimes: 0,
      pstnReqtimes: 0,
      cmrReqtimes: 0,
      voipTimer: null,
      videoTimer: null,
      pstnTimer: null,
      cmrTimer: null,
      currentQos: 'voip',
    };
  }

  public $onInit() {
    this.overview = this.SearchService.getStorage('webexOneMeeting.overview');
    this.featAndconn = this.SearchService.getStorage('webexOneMeeting.featAndconn');
    this.conferenceID = _.get(this.$stateParams, 'cid');
    this.getParticipants();
  }

  public onChangeQOS(qos) {
    this.loading = true;
    this.data.currentQos = qos;
    this.lineColor = _.cloneDeep(this.data[qos]);
    this.pstnData = qos === 'voip' ? _.cloneDeep(this.data.pstn) : undefined;
    if (this.data.cmr) {
      this.cmrData = qos === 'voip' ? _.cloneDeep(this.data.cmr.audio) : _.cloneDeep(this.data.cmr.video);
    }
    this.$timeout(() => this.loading = false, 200);
  }

  private getParticipants() {
    this.SearchService.getUniqueParticipants(this.conferenceID)
      .then((res: any) => {
        const timeZone = this.SearchService.getStorage('timeZone');
        const wom = this.SearchService.getStorage('webexOneMeeting');
        const lines = _.map(res, (item) => this.formateLine(_.get(item, 'participants')));
        this.dataSet = { lines: lines, endTime: _.get(wom, 'endTime'), startTime: _.get(wom, 'startTime'), offset: this.SearchService.getOffset(timeZone) };

        const ids = this.getAllIds(lines);
        const pstnIds = this.getFilterIds(res);
        const cmrIds = this.getFilterIds(res, 'cmr');

        const cachePromises: ng.IPromise<any>[] = [];
        cachePromises.push(this.getJoinMeetingTime());
        cachePromises.push(this.voipQOS(ids));
        cachePromises.push(this.videoQOS(ids));
        cachePromises.push(this.pstnQOS(pstnIds));
        cachePromises.push(this.cmrQOS(cmrIds));
        this.$q.all(cachePromises).finally(() => {
          this.loading = false;
        });
      })
      .catch((err) => {
        this.loading = true;
        this.Notification.errorResponse(err, 'errors.statusError', { status: err.status });
      });
  }

  private getJoinMeetingTime() {
    return this.SearchService.getJoinMeetingTime(this.conferenceID)
      .then( res => this.circleColor = res );
  }

  private voipQOS(ids) {
    return this.SearchService.getQOS(this.conferenceID, ids, 'voip-network-qos')
    .then( res => this.getLineCircleData(res, 'voip') );
  }

  private videoQOS(ids) {
    return this.SearchService.getQOS(this.conferenceID, ids, 'video-network-qos')
    .then( res => this.getLineCircleData(res, 'video') );
  }

  private pstnQOS(ids) { // TODO, will discuss with backend to optimize the response data.
    if (!_.size(ids)) {
      return this.$q.reject();
    }

    return this.SearchService.getQOS(this.conferenceID, ids, 'pstn-qos')
    .then((res: any) => {
      const obj = {};
      const retryIds: String[] = [];

      _.map(res, (item: any, key: string) => {
        obj[key] = [];
        if (item.completed) {
          _.forEach(item.items, (item_) => {
            const data = _.cloneDeep(item_);
            const arr_ = data.tahoeQuality;
            _.unset(data, 'tahoeQuality');

            const arr__ = _.map(arr_, item__ => _.assignIn({ type: 'PSTN', nodeId: key, quality: this.getPSTNQuality(item__) }, item__, data));
            obj[key] = _.concat(obj[key], arr__);
          });
        } else {
          retryIds.push(key);
        }
      });
      _.assignIn(this.data.pstn, obj);
      this.pstnData = _.get(this.data, 'currentQos') === 'voip' ? _.cloneDeep(this.data.pstn) : this.pstnData;

      const qosName = 'pstn';
      if (_.size(retryIds) && this.data[`${qosName}Reqtimes`] < 5) {
        this.$timeout.cancel(this.data[`${qosName}Timer`]);
        this.data[`${qosName}Timer`] = this.$timeout(() => {
          this.data[`${qosName}Reqtimes`] += 1;
          this.pstnQOS(_.join(retryIds));
        }, 3000);
      }
    });
  }

  private cmrQOS(ids) {
    if (!_.size(ids)) {
      return this.$q.reject();
    }

    return this.SearchService.getQOS(this.conferenceID, ids, 'cmr-qos')
    .then((res: any) => {
      const obj = { audio: {}, video: {} };
      const retryIds: String[] = [];

      _.forEach(res, (item: any, key: any) => {
        obj.audio[key] = [];
        obj.video[key] = [];
        if (item.completed) {
          _.forEach(item.items, (item_) => {
            const data = _.cloneDeep(item_);
            const audioQos = data.audioQos;
            const videoQos = data.videoQos;
            _.unset(data, 'audioQos');
            _.unset(data, 'videoQos');
            const audioArr = _.map(audioQos.VCS, item__ => _.assignIn({ type: 'VoIP', nodeId: key, quality: this.getCMRQuality(item__) }, item__, data));
            const videoArr = _.map(videoQos.VCS, item__ => _.assignIn({ type: 'Video', nodeId: key, quality: this.getCMRQuality(item__) }, item__, data));

            obj.audio[key] = _.concat(obj.audio[key], audioArr);
            obj.video[key] = _.concat(obj.video[key], videoArr);
          });
        } else {
          retryIds.push(key);
        }
      });
      _.assignIn(this.data.cmr, obj);
      this.cmrData = _.get(this.data, 'currentQos') === 'voip' ? _.cloneDeep(this.data.cmr.audio) : _.cloneDeep(this.data.cmr.video);

      const qosName = 'cmr';
      if (_.size(retryIds) && this.data[`${qosName}Reqtimes`] < 5) {
        this.$timeout.cancel(this.data[`${qosName}Timer`]);
        this.data[`${qosName}Timer`] = this.$timeout(() => {
          this.data[`${qosName}Reqtimes`] += 1;
          this.cmrQOS(_.join(retryIds));
        }, 3000);
      }
    });
  }

  private getCMRQuality(item) {
    const jitQOS = _.parseInt(item.jitter) > 20 ? -1 : 1; // TODO, need to discuss, 1 -- good, -1 -- bad
    const lossRatQOS = _.parseInt(item.lossRate) > 0.05 ? -1 : 1; // TODO, need to discuss, 1 -- good, -1 -- bad
    const qos = jitQOS + lossRatQOS; // TODO, need to discuss, good+good = good, good+bad=fair, bad+bad=bad.
    let quality = 'Fair';
    quality = qos < 0 ? 'Poor' : quality;
    quality = qos > 0 ? 'Good' : quality;

    return quality;
  }

  private getPSTNQuality(item) {
    let quality = 'Fair';
    const audioMos = _.parseInt(item.audioMos);
    if ( audioMos > 3 ) {
      quality = 'Good';
    } else if ( audioMos < 3 && audioMos > 0 ) {
      quality = 'Poor';
    }
    return quality;
  }

  private formateLine(lines) {
    const wom = this.SearchService.getStorage('webexOneMeeting');
    return _.forEach(lines, (item) => {
      const endTime = _.get(wom, 'endTime');
      const leaveTime = (!item.leaveTime || item.leaveTime > endTime) ? endTime : item.leaveTime;
      const device = this.SearchService.getDevice({ platform: item.platform, browser: item.browser, sessionType: item.sessionType });
      const platform_ = this.SearchService.getPlartform({ platform: item.platform, sessionType: item.sessionType });

      item.leaveTime = leaveTime;
      item.platform_ = platform_;
      item.device = _.get(device, 'name');
      item.deviceIcon = _.get(device, 'icon');
      item.browser_ = this.SearchService.getBrowser(_.parseInt(item.browser));
      item.joinTime_ = this.SearchService.timestampToDate(item.joinTime, 'h:mm A');
      item.mobile = _.includes(['7', '8', '11', '12', '13', '14'], item.platform) ? platform_ : '';
      item.duration = item.duration ? item.duration : _.round((item.leaveTime - item.joinTime) / 1000);
    });
  }

  private getLineCircleData(res, qosName) {
    const obj = {};
    const retryIds: String[] = [];

    _.forEach(res, (item: any, key: string) => {
      if (!item.completed) {
        retryIds.push(key);
        return true;
      }

      obj[key] = _.map(item.items, (oneItem) => _.assign({}, oneItem, { type: _.capitalize(qosName) }) );
    });

    _.assignIn(this.data[qosName], obj);
    this.lineColor = _.get(this.data, 'currentQos') === qosName ? _.cloneDeep(this.data[qosName]) : this.lineColor;

    if (_.size(retryIds) && this.data[`${qosName}Reqtimes`] < 5) {
      this.$timeout.cancel(this.data[`${qosName}Timer`]);
      this.data[`${qosName}Timer`] = this.$timeout(() => {
        this.data[`${qosName}Reqtimes`] += 1;
        qosName === 'voip' ? this.voipQOS(_.join(retryIds)) : this.videoQOS(_.join(retryIds));
      }, 3000);
    }
  }

  private getAllIds(lines) {
    let arr = [];
    _.map(lines, (item: any) => arr = _.concat(arr, item));
    return _.join(_.map(arr, (item) => _.get(item, 'nodeId')));
  }

  private getFilterIds(res, type: string = 'pstn') {
    const arr = type === 'pstn' ?
    _.filter(res, (item: any) => !(_.parseInt(item.sessionType) === 0 && _.parseInt(item.platform) === 10))
    : _.filter(res, (item: any) => _.parseInt(item.sessionType) === 0 && _.parseInt(item.platform) === 10);
    const lines = _.map(arr, (item) => this.formateLine(_.get(item, 'participants')));
    return this.getAllIds(lines);
  }
}

export class MeetingdetailsComponent implements ng.IComponentOptions {
  public controller = Meetingdetails;
  public template = require('modules/core/customerReports/webexReports/diagnostic/tabMeetingdetails.html');
}
