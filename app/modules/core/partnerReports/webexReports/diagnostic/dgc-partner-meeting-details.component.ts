import { Notification } from 'modules/core/notifications';
import { PartnerSearchService, Platforms, Quality, QualityRange } from './partner-search.service';
import { IJoinTime, ISessionDetail, IParticipant, IUniqueParticipant } from './partner-search.interfaces';

enum TabType {
  AUDIO = 'Audio',
  VIDEO = 'Video',
}

enum QualityType {
  GOOD = 'Good',
  FAIR = 'Fair',
  POOR = 'Poor',
  NA = 'NA',
}

enum QosType {
  VOIP = 'voip',
  VIDEO = 'video',
  CMR = 'cmr',
  PSTN = 'pstn',
}

enum MosType {
  GOOD = 4,
  FAIR = 3,
  POOR = 0,
}

class MeetingDetailsController implements ng.IComponentController {
  public data: any; //TODO use better type
  public dataSet: object;
  public overview: object;
  public cmrData: object;
  public pstnData: object;
  public callLegsData: object;
  public lineColor: object;
  public circleColor: object;
  public conferenceID: string;
  public tabType = TabType.AUDIO;
  public loading = true;
  public lineData = {};
  public QOS_TYPE = QosType;
  private audioLines = {};
  private videoLines = {};
  private audioEnabled = { PSTN: false, VoIP: false };
  private videoEnabled = false;
  private meetingEndTime: number;
  private qualityLabels = [QualityType.GOOD, QualityType.FAIR, QualityType.POOR, QualityType.NA];

  /* @ngInject */
  public constructor(
    private $stateParams: ng.ui.IStateParamsService,
    private $timeout: ng.ITimeoutService,
    private $translate: ng.translate.ITranslateService,
    private Notification: Notification,
    private PartnerSearchService: PartnerSearchService,
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
      currentQos: QosType.VOIP,
    };
  }

  public $onInit(): void {
    this.overview = this.PartnerSearchService.getStorage('webexOneMeeting.overview');
    this.conferenceID = _.get(this.$stateParams, 'cid');
    this.getParticipants();
  }

  public onChangeQOS(qos: string): void {
    this.loading = true;
    this.data.currentQos = qos;
    this.tabType = qos === QosType.VOIP ? TabType.AUDIO : TabType.VIDEO;
    this.setData();
    this.$timeout(() => this.loading = false, 200);
  }

  private getParticipants(): void {
    this.PartnerSearchService.getUniqueParticipants(this.conferenceID)
      .then((res: IUniqueParticipant[]) => {
        const timeZone = this.PartnerSearchService.getStorage('timeZone');
        const wom = this.PartnerSearchService.getStorage('webexOneMeeting');
        const lines: IParticipant[] = _.map(res, (item) => this.formatLine(_.get(item, 'participants')));
        this.dataSet = {
          lines: lines,
          endTime: _.get(wom, 'endTime'),
          startTime: _.get(wom, 'startTime'),
          offset: this.PartnerSearchService.getOffset(timeZone),
        };
        this.meetingEndTime = wom['endTime'] * 1;

        const ids = this.getAllIds(lines);
        const pstnIds = this.getFilterIds(res);
        const cmrIds = this.getFilterIds(res, QosType.CMR);

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
    this.PartnerSearchService.getJoinMeetingTime(this.conferenceID)
      .then((res: IJoinTime) => this.circleColor = res );
  }

  private formatLine(lines: any) {//TODO use better type
    const wom = this.PartnerSearchService.getStorage('webexOneMeeting');
    return _.forEach(lines, (item) => {
      const endTime = _.get(wom, 'endTime');
      const leaveTime = (!item.leaveTime || item.leaveTime > endTime) ? endTime : item.leaveTime;
      const device = this.PartnerSearchService.getDevice({ platform: item.platform, browser: item.browser, sessionType: item.sessionType });
      const platform_ = this.PartnerSearchService.getPlatform({ platform: item.platform, sessionType: item.sessionType });
      const mobiles = [
        Platforms.IPHONE,
        Platforms.MOBILE_DEVICE,
        Platforms.BLACK_BERRY,
        Platforms.WIN_MOBILE,
        Platforms.ANDROID,
        Platforms.NOKIA,
      ];

      let enableStartPoint = true;
      const logUserId = item.logUserId * 1;
      if (item.sessionType === Platforms.PSTN && logUserId) {
        enableStartPoint = false;
      }

      item.enableStartPoint = enableStartPoint;
      item.cid = item.callerId ? item.callerId : '';
      item.leaveTime = leaveTime;
      item.platform_ = platform_;
      item.device = _.get(device, 'name');
      item.deviceIcon = _.get(device, 'icon');
      item.browser_ = this.PartnerSearchService.getBrowser(_.parseInt(item.browser));
      item.joinTime_ = this.PartnerSearchService.timestampToDate(item.joinTime, 'h:mm A');
      item.mobile = _.includes(mobiles, item.platform) ? platform_ : '';
      item.duration = item.duration ? item.duration : _.round((item.leaveTime - item.joinTime) / 1000);
    });
  }

  private getVoipSessionDetail(ids: string): void {
    if (!_.size(ids)) {
      return;
    }
    this.PartnerSearchService.getVoipSessionDetail(this.conferenceID, ids)
      .then(res => {
        const retryIds: string[] = [];
        const details = this.audioLines;
        _.forEach(res.items, item => {
          if (!details[item.key]) {
            details[item.key] = [];
          }
          if (item.completed) {
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
                  source: QosType.VOIP,
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

        this.retryRequest(QosType.VOIP, this.getVoipSessionDetail, retryIds);
      });
  }

  private getVideoSessionDetail(ids: string): void {
    if (!_.size(ids)) {
      return;
    }
    this.PartnerSearchService.getVideoSessionDetail(this.conferenceID, ids)
      .then((res: ISessionDetail) => {
        const retryIds: string[] = [];
        const details = this.videoLines;
        _.forEach(res.items, item => {
          if (!details[item.key]) {
            details[item.key] = [];
          }
          if (item.completed) {
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
                  source: QosType.VIDEO,
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

        this.retryRequest(QosType.VIDEO, this.getVideoSessionDetail, retryIds);
      });
  }

  private getPSTNSessionDetail(pstnIds: string): void {
    if (!_.size(pstnIds)) {
      return;
    }
    this.PartnerSearchService.getPSTNSessionDetail(this.conferenceID, pstnIds)
      .then((res: ISessionDetail) => {
        const retryIds: string[] = [];
        const details = this.audioLines;
        _.forEach(res.items, item => {
          if (item.completed) {
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
                  source: QosType.PSTN,
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

        this.retryRequest(QosType.PSTN, this.getPSTNSessionDetail, retryIds);
      });
  }

  private getCMRSessionDetail(cmrIds: string): void {
    if (!_.size(cmrIds)) {
      return;
    }
    this.PartnerSearchService.getCMRSessionDetail(this.conferenceID, cmrIds)
      .then((res: ISessionDetail) => {
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
                    source: QosType.CMR,
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
                    source: QosType.CMR,
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

        this.retryRequest(QosType.CMR, this.getCMRSessionDetail, retryIds);
      });
  }

  private parseVoipQuality(lossrates: number, rtts: string): number {
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

  private parseVoipTooltip(lossrates: number, rtts: string, aliasKey?: string): string {
    const qualityIndex = this.parseVoipQuality(lossrates, rtts) - 1;
    const lossRate = lossrates * 1;
    const latency = _.parseInt(rtts);
    const items = [{
      key: aliasKey ? this.$translate.instant('webexReports.cmrQuality') : this.$translate.instant('webexReports.voipQuality'),
      value: this.qualityLabels[qualityIndex],
    }, {
      key: this.$translate.instant('webexReports.latency'),
      value: latency > 999 ? `> ${this.$translate.instant('time.capitalized.seconds', { time: 1 }, 'messageformat')}` : `${latency} ms`,
    }, {
      key: this.$translate.instant('webexReports.packetLoss'),
      value: lossRate > 9.9 ? '> 10%' : `${_.round(lossRate, 2)}%`,
    }];
    return this.formatTooltip(items);
  }

  private parseVideoQuality(lossrates: number, rtts: string): number {
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
    const items = [{
      key: aliasKey ? this.$translate.instant('webexReports.cmrQuality') : this.$translate.instant('webexReports.videoQuality'),
      value: this.qualityLabels[qualityIndex],
    }, {
      key: this.$translate.instant('webexReports.latency'),
      value: latency > 999 ? `> ${this.$translate.instant('time.capitalized.seconds', { time: 1 }, 'messageformat')}` : `${latency} ms`,
    }, {
      key: this.$translate.instant('webexReports.packetLoss'),
      value: lossRate > 9.9 ? '> 10%' : `${_.round(lossRate, 2)}%`,
    }];
    return this.formatTooltip(items);
  }

  private parsePSTNQuality(audioMos: number): number {
    let qualityIndex = Quality.NA;
    const mos = audioMos * 1;
    if (mos >= MosType.GOOD) {
      qualityIndex = Quality.GOOD;
    } else if (mos < MosType.FAIR && mos > MosType.POOR) {
      qualityIndex = Quality.POOR;
    } else {
      qualityIndex = Quality.FAIR;
    }
    return qualityIndex;
  }

  private parsePSTNTooltip(audioMos: number, callType: string): string {
    const qualityIndex = this.parsePSTNQuality(audioMos) - 1;
    const items = [{
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

  private formatTooltip(items: object): string {
    let tooltip: string = '';
    _.forEach(items, item => {
      const cls = item.class ? item.class : '';
      const text = item.value ? `: ${item.value}` : '';
      tooltip += `<p class="${cls}"><span>${item.key}</span>${text}</p>`;
    });
    return tooltip;
  }

  private setData(): void {
    if (this.data.currentQos === QosType.VOIP) {
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

  private getAllIds(lines: IParticipant[]): string {
    let arr = [];
    _.map(lines, (item: any) => arr = _.concat(arr, item));
    return _.join(_.union(_.map(arr, (item) => _.get(item, 'nodeId'))));
  }

  private getFilterIds(res: IUniqueParticipant[], type: string = QosType.PSTN): string {
    const arr = type === QosType.PSTN
    ? _.filter(res, (item: IUniqueParticipant) => !(item.sessionType === Platforms.WINDOWS && item.platform === Platforms.TP))
    : _.filter(res, (item: IUniqueParticipant) => item.sessionType === Platforms.WINDOWS && item.platform === Platforms.TP);
    const lines = _.map(arr, (item) => this.formatLine(_.get(item, 'participants')));
    return this.getAllIds(lines);
  }
}

export class DgcPartnerMeetingDetailsComponent implements ng.IComponentOptions {
  public controller = MeetingDetailsController;
  public template = require('modules/core/partnerReports/webexReports/diagnostic/dgc-partner-meeting-details.html');
}
