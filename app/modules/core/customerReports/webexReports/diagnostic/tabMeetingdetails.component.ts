import './_search.scss';
import { ISessionDetailItem, SearchService, SearchStorage, Platforms, Quality, QualityRange } from './searchService';
import { Notification } from 'modules/core/notifications';

class Meetingdetails implements ng.IComponentController {

  public data: any;
  public dataSet: Object;
  public overview: Object;
  public cmrData: Object;
  public pstnData: Object;
  public callLegsData: Object;
  public lineColor: Object;
  public circleColor: Object;
  public featAndconn: Object;
  public conferenceID: string;
  public tabType: string = 'Audio';
  public loading: boolean = true;
  public lineData: Object = {};
  private audioLines: Object = {};
  private videoLines: Object = {};
  private audioEnabled: { [key: string]: boolean; } = { PSTN: false, VoIP: false };
  private videoEnabled: boolean = false;
  private meetingEndTime: number;
  private qualityLabels: string[] = ['Good', 'Fair', 'Poor', 'N/A'];

  /* @ngInject */
  public constructor(
    private Notification: Notification,
    private SearchService: SearchService,
    private $timeout: ng.ITimeoutService,
    private $stateParams: ng.ui.IStateParamsService,
    private $translate: ng.translate.ITranslateService,
  ) {
    this.data = {
      voip: {},
      video: {},
      pstn: {},
      cmr: {},
      voipReqTimes: 0,
      videoReqTimes: 0,
      pstnReqTimes: 0,
      cmrReqTimes: 0,
      retryTimes: 4,
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
    this.tabType = qos === 'voip' ? 'Audio' : 'Video';
    this.setData();
    this.$timeout(() => this.loading = false, 200);
  }

  private getParticipants() {
    this.SearchService.getUniqueParticipants(this.conferenceID)
      .then(res => {
        this.SearchService.setStorage(SearchStorage.UNIQUE_PARTICIPANTS, res);
        const timeZone = this.SearchService.getStorage('timeZone');
        const wom = this.SearchService.getStorage('webexOneMeeting');
        const lines = _.map(res, (item) => this.formatLine(_.get(item, 'participants')));
        this.dataSet = { lines: lines, endTime: _.get(wom, 'endTime'), startTime: _.get(wom, 'startTime'), offset: this.SearchService.getOffset(timeZone) };
        this.meetingEndTime = wom['endTime'] * 1;

        const ids = this.getAllIds(lines);
        const pstnIds = this.getFilterIds(res);
        const cmrIds = this.getFilterIds(res, 'cmr');

        this.getJoinMeetingTime();
        this.getVoipSessionDetail(ids);
        this.getVideoSessionDetail(ids);
        this.getPSTNSessionDetail(pstnIds);
        this.getCMRSessionDetail(cmrIds);

        this.loading = false;
      })
      .catch((err) => {
        this.loading = false;
        this.Notification.errorResponse(err, 'errors.statusError', { status: err.status });
      });
  }

  private getJoinMeetingTime(): void {
    this.SearchService.getJoinMeetingTime(this.conferenceID)
      .then(res => {
        this.circleColor = res;
        this.SearchService.setStorage(SearchStorage.JOIN_MEETING_TIMES, res);
        const clientVersion = {};
        _.forEach(res, (item) => {
          const key = `${item.userId}_${item.userName}`;
          clientVersion[key] = {
            osVersion: item.osVersion,
            browserVersion: item.browserVersion,
          };
        });
        this.SearchService.setStorage('ClientVersion', clientVersion);
        this.circleColor = res;
      });
  }

  private formatLine(lines) {
    const wom = this.SearchService.getStorage('webexOneMeeting');
    return _.forEach(lines, (item) => {
      const endTime = _.get(wom, 'endTime');
      const leaveTime = (!item.leaveTime || item.leaveTime > endTime) ? endTime : item.leaveTime;
      const device = this.SearchService.getDevice({ platform: item.platform, browser: item.browser, sessionType: item.sessionType });
      const platform_ = this.SearchService.getPlatform({ platform: item.platform, sessionType: item.sessionType });

      let enableStartPoint = true;
      const logUserId = item.logUserId * 1;
      if (item.sessionType === Platforms.PSTN && logUserId) {
        enableStartPoint = false;
      }

      item.enableStartPoint = enableStartPoint;
      item.cid = item.callerId ? item.callerId : '';
      item.clientKey = `${item.userId}_${item.userName}`;
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

  private getVoipSessionDetail(ids: string): void {
    this.SearchService.getVoipSessionDetail(this.conferenceID, ids)
      .then(res => {
        const retryIds: string[] = [];
        const details = this.audioLines;
        _.forEach(res.items, item => {
          if (!details[item.key]) {
            details[item.key] = [];
          }
          if (item.completed) {
            this.saveSessionDetailToStorage(SearchStorage.VOIP_SESSION_DETAIL, item);

            _.forEach(item.items, detailItem => {
              this.audioEnabled.VoIP = true;
              const detail = {};
              detail['startTime'] = detailItem.startTime * 1;
              detail['endTime'] = detailItem.endTime ? detailItem.endTime * 1 : this.meetingEndTime;
              detail['qualities'] = [];
              _.forEach(detailItem.mmpQuality, quality => {
                detail['qualities'].push({
                  startTime: quality.startTime * 1,
                  endTime: quality.endTime * 1,
                  quality: this.parseVoipQuality(quality.lossrates, quality.rtts),
                  tooltip: this.parseVoipTooltip(quality.lossrates, quality.rtts),
                  source: 'voip',
                });
              });
              details[item.key].push(detail);
            });
          } else {
            retryIds.push(item.key);
          }
        });
        this.audioLines = details;
        this.setData();

        this.retryRequest('voip', this.getVoipSessionDetail, retryIds);
      });
  }

  private getVideoSessionDetail(ids: string): void {
    this.SearchService.getVideoSessionDetail(this.conferenceID, ids)
      .then(res => {
        const retryIds: string[] = [];
        const details = this.videoLines;
        _.forEach(res.items, item => {
          if (!details[item.key]) {
            details[item.key] = [];
          }
          if (item.completed) {
            this.saveSessionDetailToStorage(SearchStorage.VIDEO_SESSION_DETAIL, item);

            _.forEach(item.items, detailItem => {
              this.videoEnabled = true;
              const detail = {};
              detail['startTime'] = detailItem.startTime * 1;
              detail['endTime'] = detailItem.endTime ? detailItem.endTime * 1 : this.meetingEndTime;
              detail['qualities'] = [];
              _.forEach(detailItem.mmpQuality, quality => {
                detail['qualities'].push({
                  startTime: quality.startTime * 1,
                  endTime: quality.endTime * 1,
                  quality: this.parseVideoQuality(quality.lossrates, quality.rtts),
                  tooltip: this.parseVideoTooltip(quality.lossrates, quality.rtts),
                  source: 'video',
                });
              });
              details[item.key].push(detail);
            });
          } else {
            retryIds.push(item.key);
          }
        });
        this.videoLines = details;
        this.setData();

        this.retryRequest('video', this.getVideoSessionDetail, retryIds);
      });
  }

  private getPSTNSessionDetail(pstnIds: string): void {
    if (!_.size(pstnIds)) {
      return;
    }
    this.SearchService.getPSTNSessionDetail(this.conferenceID, pstnIds)
      .then(res => {
        const retryIds: string[] = [];
        const details = this.audioLines;
        _.forEach(res.items, item => {
          if (item.completed) {
            this.saveSessionDetailToStorage(SearchStorage.PSTN_SESSION_DETAIL, item);

            _.forEach(item.items, detailItem => {
              const key = `${detailItem.callId}_${item.key}`;
              if (!details[key]) {
                details[key] = [];
              }
              this.audioEnabled.PSTN = true;
              const detail = {};
              detail['cid'] = detailItem.callId;
              detail['startTime'] = detailItem.startTime * 1;
              detail['endTime'] = detailItem.endTime ? detailItem.endTime * 1 : this.meetingEndTime;
              detail['qualities'] = [];
              _.forEach(detailItem.tahoeQuality, quality => {
                detail['qualities'].push({
                  startTime: quality.startTime * 1,
                  endTime: quality.endTime * 1,
                  quality: this.parsePSTNQuality(quality.audioMos),
                  tooltip: this.parsePSTNTooltip(quality.audioMos, detailItem.callType),
                  source: 'pstn',
                });
              });
              details[key].push(detail);
            });
          } else {
            retryIds.push(item.key);
          }
        });
        this.audioLines = details;
        this.setData();

        this.retryRequest('pstn', this.getPSTNSessionDetail, retryIds);
      });
  }

  private getCMRSessionDetail(cmrIds: string): void {
    if (!_.size(cmrIds)) {
      return;
    }
    this.SearchService.getCMRSessionDetail(this.conferenceID, cmrIds)
      .then(res => {
        const retryIds: string[] = [];
        const audioDetails = this.audioLines;
        const videoDetails = this.videoLines;
        _.forEach(res.items, item => {
          if (!audioDetails[item.key]) {
            audioDetails[item.key] = [];
          }
          if (!videoDetails[item.key]) {
            videoDetails[item.key] = [];
          }
          if (item.completed) {
            // TODO: setStorage for CMR Audio/Video session detail.
            // Because for now there is no CMR quality data, so this feature will be hold util CMR quality data is ready.

            _.forEach(item.items, detailItem => {
              const audioDetail = {};
              audioDetail['startTime'] = detailItem.connectionStartTime * 1;
              audioDetail['endTime'] = detailItem.connectEndTime ? detailItem.connectEndTime * 1 : this.meetingEndTime;
              audioDetail['qualities'] = [];
              _.forEach(detailItem.audioQos, audioQuality => {
                _.forEach(audioQuality.values, audioQualityValue => {
                  audioDetail['qualities'].push({
                    startTime: audioQualityValue.startTime * 1,
                    endTime: audioQualityValue.endTime * 1,
                    quality: this.parseVoipQuality(audioQualityValue.lossRate, audioQualityValue.packetLoss),
                    source: 'cmr',
                    tooltip: this.parseVoipTooltip(audioQualityValue.lossRate, audioQualityValue.packetLoss, 'CMR'),
                  });
                });
              });
              audioDetails[item.key].push(audioDetail);

              const videoDetail = {};
              videoDetail['startTime'] = detailItem.connectionStartTime * 1;
              videoDetail['endTime'] = detailItem.connectEndTime ? detailItem.connectEndTime * 1 : this.meetingEndTime;
              videoDetail['qualities'] = [];
              _.forEach(detailItem.videoQos, videoQuality => {
                _.forEach(videoQuality.values, videoQualityValue => {
                  videoDetail['qualities'].push({
                    startTime: videoQualityValue.startTime * 1,
                    endTime: videoQualityValue.endTime * 1,
                    quality: this.parseVideoQuality(videoQualityValue.lossRate, videoQualityValue.packetLoss),
                    source: 'cmr',
                    tooltip: this.parseVideoTooltip(videoQualityValue.lossRate, videoQualityValue.packetLoss, 'CMR'),
                  });
                });
              });
              videoDetails[item.key].push(videoDetail);
            });
          } else {
            retryIds.push(item.key);
          }
        });
        this.audioLines = audioDetails;
        this.videoLines = videoDetails;
        this.setData();

        this.retryRequest('cmr', this.getCMRSessionDetail, retryIds);
      });
  }

  private parseVoipQuality(lossrates, rtts): number {
    const lossRate = lossrates * 1;
    const latency = _.parseInt(rtts);
    let qualityIndex = Quality.NA;
    if (lossRate < QualityRange.LOWER_LOSSRATE && latency < QualityRange.LOWER_LATENCY) {
      qualityIndex = Quality.GOOD;
    } else if (lossRate > QualityRange.UPPER_LOSSRATE && latency > QualityRange.UPPER_LATENCY) {
      qualityIndex = Quality.POOR;
    } else {
      qualityIndex = Quality.FAIR;
    }
    return qualityIndex;
  }

  private parseVoipTooltip(lossrates, rtts, aliasKey?: string): string {
    const qualityIndex = this.parseVoipQuality(lossrates, rtts) - 1;
    const lossRate = lossrates * 1;
    const latency = _.parseInt(rtts);
    const items: Object[] = [{
      key: aliasKey ? this.$translate.instant('webexReports.cmrQuality') : this.$translate.instant('webexReports.voipQuality'),
      value: this.qualityLabels[qualityIndex],
    }, {
      key: this.$translate.instant('webexReports.latency'),
      value: latency > 999 ? `> ${this.$translate.instant('time.capitalized.seconds', { time: 1 }, 'messageformat')}` : latency + ' ms',
    }, {
      key: this.$translate.instant('webexReports.packetLoss'),
      value: lossRate > 9.9 ? '> 10%' : _.round(lossRate, 2) + `%`,
    }];
    return this.formatTooltip(items);
  }

  private parseVideoQuality(lossrates, rtts) {
    const lossRate = lossrates * 1;
    const latency = _.parseInt(rtts);
    let qualityIndex = Quality.NA;
    if (lossRate > QualityRange.UPPER_LOSSRATE || latency > QualityRange.UPPER_LATENCY) {
      qualityIndex = Quality.POOR;
    } else {
      qualityIndex = Quality.GOOD;
    }
    return qualityIndex;
  }

  private parseVideoTooltip(lossrates, rtts, aliasKey?: string): string {
    const qualityIndex = this.parseVideoQuality(lossrates, rtts) - 1;
    const lossRate = lossrates * 1;
    const latency = _.parseInt(rtts);
    const items: Object[] = [{
      key: aliasKey ? this.$translate.instant('webexReports.cmrQuality') : this.$translate.instant('webexReports.videoQuality'),
      value: this.qualityLabels[qualityIndex],
    }, {
      key: this.$translate.instant('webexReports.latency'),
      value: latency > 999 ? `> ${this.$translate.instant('time.capitalized.seconds', { time: 1 }, 'messageformat')}` : latency + ' ms',
    }, {
      key: this.$translate.instant('webexReports.packetLoss'),
      value: lossRate > 9.9 ? '> 10%' : _.round(lossRate, 2) + `%`,
    }];
    return this.formatTooltip(items);
  }

  private parsePSTNQuality(audioMos) {
    let qualityIndex = 4;
    const mos = audioMos * 1;
    if (mos >= 4) {
      qualityIndex = 1;
    } else if (mos < 3 && mos > 0) {
      qualityIndex = 3;
    } else {
      qualityIndex = 2;
    }
    return qualityIndex;
  }

  private parsePSTNTooltip(audioMos, callType): string {
    const qualityIndex = this.parsePSTNQuality(audioMos) - 1;
    const items: Object[] = [{
      key: this.$translate.instant('webexReports.pstnQuality'),
      value: this.qualityLabels[qualityIndex],
    }, {
      key: this.$translate.instant('webexReports.mosScore'),
      value: audioMos,
    }, {
      key: this.$translate.instant('webexReports.callType'),
      value: callType,
    }];
    return this.formatTooltip(items);
  }

  private retryRequest(timer: string, request: Function, params: string[]): void {
    if (_.size(params) && this.data[`${timer}ReqTimes`] < this.data.retryTimes) {
      this.$timeout.cancel(this.data[`${timer}Timer`]);
      this.data[`${timer}Timer`] = this.$timeout(() => {
        this.data[`${timer}ReqTimes`] += 1;
        request.call(this, _.join(params));
      }, 3000);
    }
  }

  private formatTooltip(items): string {
    let tooltip: string = '';
    _.forEach(items, item => {
      const cls = item.class ? item.class : '';
      const text = item.value ? `: ${item.value}` : '';
      tooltip += `<p class="${cls}"><span>${item.key}</span>${text}</p>`;
    });
    return tooltip;
  }

  private setData() {
    if (this.data.currentQos === 'voip') {
      this.lineData = _.cloneDeep(this.audioLines);
    } else {
      this.lineData = _.cloneDeep(this.videoLines);
    }

    const audioTypes: string[] = [], videoTypes: string[] = [];
    _.forEach(this.audioEnabled, (isEnabled: boolean, key: string) => {
      if (isEnabled) {
        audioTypes.push(key);
      }
    });
    if (this.videoEnabled) {
      videoTypes.push(this.$translate.instant('common.yes'));
    } else {
      videoTypes.push(this.$translate.instant('common.no'));
    }
    this.overview['audioSession'] = audioTypes.join(` ${this.$translate.instant('common.and')} `);
    this.overview['videoSession'] = videoTypes.join();
  }

  private getAllIds(lines) {
    let arr = [];
    _.map(lines, (item: any) => arr = _.concat(arr, item));
    return _.join(_.union(_.map(arr, (item) => _.get(item, 'nodeId'))));
  }

  private getFilterIds(res, type: string = 'pstn') {
    const arr = type === 'pstn' ?
    _.filter(res, (item: any) => !(_.parseInt(item.sessionType) === 0 && _.parseInt(item.platform) === 10))
    : _.filter(res, (item: any) => _.parseInt(item.sessionType) === 0 && _.parseInt(item.platform) === 10);
    const lines = _.map(arr, (item) => this.formatLine(_.get(item, 'participants')));
    return this.getAllIds(lines);
  }

  private saveSessionDetailToStorage(sessionType: string, sessionDetail: ISessionDetailItem): void {
    const sessionDetailByNodeId = {};
    sessionDetailByNodeId[sessionDetail.key] = sessionDetail.items;
    const newDetail = _.assign(this.SearchService.getStorage(sessionType) || {}, sessionDetailByNodeId);
    this.SearchService.setStorage(sessionType, newDetail);
  }
}

export class MeetingdetailsComponent implements ng.IComponentOptions {
  public controller = Meetingdetails;
  public template = require('modules/core/customerReports/webexReports/diagnostic/tabMeetingdetails.html');
}
