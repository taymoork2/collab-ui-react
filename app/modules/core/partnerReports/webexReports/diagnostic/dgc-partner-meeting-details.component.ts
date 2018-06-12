import { Notification } from 'modules/core/notifications';
import { PartnerSearchService, Platforms, Quality, QualityRange } from './partner-search.service';
import { IJoinTime, ISessionDetail, ISessionDetailItem, IParticipant, IUniqueParticipant } from './partner-search.interfaces';
import { MosType, QualityType, QosType, TabType } from './partner-meeting.enum';

interface IDataStore {
  retryTimes: number;
  voip: object;
  video: object;
  pstn: object;
  cmr: object;
  voipReqTimes: number;
  videoReqTimes: number;
  pstnReqTimes: number;
  cmrReqTimes: number;
  currentQos: string;
}

interface IQuality {
  audioMos: string;
  startTime: number;
  endTime: number;
  lossrates: string;
  rtts: string;
  lossRate: string;
  packetLoss: string;
}

interface IQualitySet {
  startTime?: number;
  endTime?: number;
  qualities: {
    startTime: number;
    endTime: number;
    quality: number;
    tooltip: string,
    source: string,
  }[];
}

const LATENCY_SHOWUP = 999;
const LOSSRATE_SHOWUP = 9.9;
class MeetingDetailsController implements ng.IComponentController {
  public data: IDataStore;
  public dataSet: { lines: IParticipant[][], endTime: number, startTime: number, offset: string };
  public overview: { audioSession: string, videoSession: string };
  public circleJoinTime: IJoinTime[];
  public conferenceID: string;
  public tabType = TabType.AUDIO;
  public loading = true;
  public lineData: IUniqueParticipant;
  public QOS_TYPE = QosType;
  private audioLines: IUniqueParticipant;
  private videoLines: IUniqueParticipant;
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

    /**
     * Improve the user experience, when users click the switch button,
     * we need to give user a loading response in time.
     * the loading state is not response to the page if without timeout
     */
    this.$timeout(() => this.loading = false, 200);
  }

  private getParticipants(): void {
    this.PartnerSearchService.getUniqueParticipants(this.conferenceID)
      .then((res: IUniqueParticipant[]) => {
        const timeZone = this.PartnerSearchService.getStorage('timeZone');
        const webexOneMeeting = this.PartnerSearchService.getStorage('webexOneMeeting');
        const lines: IParticipant[][] = this.parseUniqueParticipants(res);

        this.dataSet = {
          lines: lines,
          endTime: _.get(webexOneMeeting, 'endTime'),
          startTime: _.get(webexOneMeeting, 'startTime'),
          offset: this.PartnerSearchService.getOffset(timeZone),
        };
        this.meetingEndTime = webexOneMeeting['endTime'] * 1;

        const nodeIds = this.getAllIds(lines);
        const pstnNodeIds = this.getFilterIds(res);
        const cmrNodeIds = this.getFilterIds(res, QosType.CMR);

        this.getJoinMeetingTime();
        this.getVoipSessionDetail(nodeIds);
        this.getVideoSessionDetail(nodeIds);
        this.getPSTNSessionDetail(pstnNodeIds);
        this.getCMRSessionDetail(cmrNodeIds);
      })
      .catch((err) => {
        this.Notification.errorResponse(err, 'errors.statusError', { status: err.status });
      })
      .finally(() => {
        this.loading = false;
      });
  }

  private parseUniqueParticipants(uniqueParticipants: IUniqueParticipant[]): IParticipant[][] {
    return _.map(uniqueParticipants, uniqueParticipant => {
      return this.formatLines(_.get(uniqueParticipant, 'participants'));
    });
  }

  private getJoinMeetingTime(): void {
    this.PartnerSearchService.getJoinMeetingTime(this.conferenceID)
      .then((res: IJoinTime[]) => {
        const clientVersion = {};
        _.forEach(res, (joinTime) => {
          const key = `${ joinTime.userId }_${ joinTime.userName }`;
          clientVersion[key] = {
            osVersion: joinTime.osVersion,
            browserVersion: joinTime.browserVersion,
          };
        });
        this.PartnerSearchService.setStorage('ClientVersion', clientVersion);
        this.circleJoinTime = res;
      });
  }

  private formatLines(lines: IParticipant[]): IParticipant[] {
    const wom = this.PartnerSearchService.getStorage('webexOneMeeting');
    return _.map(lines, (line: any) => { //TODO use better type
      const endTime = _.get(wom, 'endTime');
      const leaveTime = (!line.leaveTime || line.leaveTime > endTime) ? endTime : line.leaveTime;
      const device = this.PartnerSearchService.getDevice({ platform: line.platform, browser: line.browser, sessionType: line.sessionType });
      const platform_ = this.PartnerSearchService.getPlatform({ platform: line.platform, sessionType: line.sessionType });
      const mobiles = [
        Platforms.IPHONE,
        Platforms.MOBILE_DEVICE,
        Platforms.BLACK_BERRY,
        Platforms.WIN_MOBILE,
        Platforms.ANDROID,
        Platforms.NOKIA,
      ];

      let enableStartPoint = true;
      const logUserId = line.logUserId * 1;
      if (line.sessionType === Platforms.PSTN && logUserId) {
        enableStartPoint = false;
      }

      line.enableStartPoint = enableStartPoint;
      line.cid = line.callerId ? line.callerId : '';
      line.leaveTime = leaveTime;
      line.platform_ = platform_;
      line.device = _.get(device, 'name');
      line.deviceIcon = _.get(device, 'icon');
      line.browser_ = this.PartnerSearchService.getBrowser(_.parseInt(line.browser));
      line.joinTime_ = this.PartnerSearchService.timestampToDate(line.joinTime, 'h:mm A');
      line.mobile = _.includes(mobiles, line.platform) ? platform_ : '';
      line.duration = line.duration ? line.duration : _.round((line.leaveTime - line.joinTime) / 1000);
      line.clientKey = `${line.userId}_${line.userName}`;
      return line;
    });
  }

  private getVoipSessionDetail(nodeIds: string): void {
    if (!_.size(nodeIds)) {
      return;
    }
    this.PartnerSearchService.getVoipSessionDetail(this.conferenceID, nodeIds)
      .then((res: ISessionDetail) => {
        const retryIds = this.parseVoipSession(res);
        this.setData();
        this.retryRequest(QosType.VOIP, this.getVoipSessionDetail, retryIds);
      });
  }

  private parseVoipSession(sessionDetail: ISessionDetail): string[] {
    const retryIds: string[] = [];
    const details = this.audioLines || {};
    _.forEach(sessionDetail.items, (item: ISessionDetailItem) => {
      if (!details[item.key]) {
        details[item.key] = [];
      }
      if (item.completed) {
        _.forEach(item.items, detailItem => {
          this.audioEnabled.VoIP = true;
          const detail = this.parseVoipQualities(detailItem);
          details[item.key].push(detail);
        });
      } else {
        retryIds.push(item.key);
      }
    });
    this.audioLines = details;
    return retryIds;
  }

  private parseVoipQualities(detailItem: { callId: string, startTime: number, endTime: number, callType: string, mmpQuality: IQuality[] }): IQualitySet {
    const detail: IQualitySet = { qualities: [] };
    detail['startTime'] = detailItem.startTime * 1;
    detail['endTime'] = detailItem.endTime ? detailItem.endTime * 1 : this.meetingEndTime;
    _.forEach(detailItem.mmpQuality, quality => {
      detail['qualities'].push({
        startTime: quality.startTime * 1,
        endTime: quality.endTime * 1,
        quality: this.parseVoipQuality(quality.lossrates, quality.rtts),
        tooltip: this.parseVoipTooltip(quality.lossrates, quality.rtts),
        source: QosType.VOIP,
      });
    });
    return detail;
  }

  private getVideoSessionDetail(nodeIds: string): void {
    if (!_.size(nodeIds)) {
      return;
    }
    this.PartnerSearchService.getVideoSessionDetail(this.conferenceID, nodeIds)
      .then((res: ISessionDetail) => {
        const retryIds = this.parseVideoSession(res);
        this.setData();
        this.retryRequest(QosType.VIDEO, this.getVideoSessionDetail, retryIds);
      });
  }

  private parseVideoSession(sessionDetail: ISessionDetail): string[] {
    const retryIds: string[] = [];
    const details = this.videoLines || {};
    _.forEach(sessionDetail.items, (item: ISessionDetailItem) => {
      if (!details[item.key]) {
        details[item.key] = [];
      }
      if (item.completed) {
        _.forEach(item.items, detailItem => {
          this.videoEnabled = true;
          const detail = this.parseVideoQualities(detailItem);
          details[item.key].push(detail);
        });
      } else {
        retryIds.push(item.key);
      }
    });
    this.videoLines = details;
    return retryIds;
  }

  private parseVideoQualities(detailItem: { callId: string, startTime: number, endTime: number, callType: string, mmpQuality: IQuality[] }): IQualitySet {
    const detail: IQualitySet = { qualities: [] };
    detail['startTime'] = detailItem.startTime * 1;
    detail['endTime'] = detailItem.endTime ? detailItem.endTime * 1 : this.meetingEndTime;
    _.forEach(detailItem.mmpQuality, quality => {
      detail['qualities'].push({
        startTime: quality.startTime * 1,
        endTime: quality.endTime * 1,
        quality: this.parseVideoQuality(quality.lossrates, quality.rtts),
        tooltip: this.parseVideoTooltip(quality.lossrates, quality.rtts),
        source: QosType.VIDEO,
      });
    });
    return detail;
  }

  private getPSTNSessionDetail(nodeIds: string): void {
    if (!_.size(nodeIds)) {
      return;
    }
    this.PartnerSearchService.getPSTNSessionDetail(this.conferenceID, nodeIds)
      .then((res: ISessionDetail) => {
        const retryIds = this.parsePSTNSession(res);
        this.setData();
        this.retryRequest(QosType.PSTN, this.getPSTNSessionDetail, retryIds);
      });
  }

  private parsePSTNSession(sessionDetail: ISessionDetail): string[] {
    const retryIds: string[] = [];
    const details = this.audioLines || {};
    _.forEach(sessionDetail.items, (item: ISessionDetailItem) => {
      if (item.completed) {
        _.forEach(item.items, detailItem => {
          const key = `${detailItem.callId}_${item.key}`;
          if (!details[key]) {
            details[key] = [];
          }
          this.audioEnabled.PSTN = true;
          const detail = this.parsePSTNQualities(detailItem);
          details[key].push(detail);
        });
      } else {
        retryIds.push(item.key);
      }
    });
    this.audioLines = details;
    return retryIds;
  }

  private parsePSTNQualities(detailItem: { callId: string, startTime: number, endTime: number, callType: string, tahoeQuality: IQuality[] }): IQualitySet {
    const detail: IQualitySet = { qualities: [] };
    detail['cid'] = detailItem.callId;
    detail['startTime'] = detailItem.startTime * 1;
    detail['endTime'] = detailItem.endTime ? detailItem.endTime * 1 : this.meetingEndTime;

    _.forEach(detailItem.tahoeQuality, quality => {
      detail['qualities'].push({
        startTime: quality.startTime * 1,
        endTime: quality.endTime * 1,
        quality: this.parsePSTNQuality(quality.audioMos),
        tooltip: this.parsePSTNTooltip(quality.audioMos, detailItem.callType),
        source: QosType.PSTN,
      });
    });
    return detail;
  }

  private getCMRSessionDetail(nodeIds: string): void {
    if (!_.size(nodeIds)) {
      return;
    }
    this.PartnerSearchService.getCMRSessionDetail(this.conferenceID, nodeIds)
      .then((res: ISessionDetail) => {
        const retryIds = this.parseCMRQualities(res);
        this.setData();
        this.retryRequest(QosType.CMR, this.getCMRSessionDetail, retryIds);
      });
  }

  private parseCMRQualities(sessionDetail: ISessionDetail): string[] {
    const retryIds: string[] = [];
    const audioDetails = this.audioLines || {};
    const videoDetails = this.videoLines || {};
    _.forEach(sessionDetail.items, (session: ISessionDetailItem) => {
      if (!audioDetails[session.key]) {
        audioDetails[session.key] = [];
      }
      if (!videoDetails[session.key]) {
        videoDetails[session.key] = [];
      }
      if (session.completed) {
        _.forEach(session.items, detailItem => {
          const audioDetail = this.parseAudioDetailQualities(detailItem);
          audioDetails[session.key].push(audioDetail);

          const videoDetail = this.parseVideoDetailQualities(detailItem);
          videoDetails[session.key].push(videoDetail);
        });
      } else {
        retryIds.push(session.key);
      }
    });
    this.audioLines = audioDetails;
    this.videoLines = videoDetails;
    return retryIds;
  }

  private parseAudioDetailQualities(detailItem: { connectionStartTime: number, connectEndTime: number, audioQos: { values: IQuality[] }[] }): IQualitySet {
    const audioDetail: IQualitySet = { qualities: [] };
    audioDetail['startTime'] = detailItem.connectionStartTime * 1;
    audioDetail['endTime'] = detailItem.connectEndTime ? detailItem.connectEndTime * 1 : this.meetingEndTime;
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
    return audioDetail;
  }

  private parseVideoDetailQualities(detailItem: { connectionStartTime: number, connectEndTime: number, videoQos: { values: IQuality[] }[] }): IQualitySet {
    const videoDetail: IQualitySet = { qualities: [] };
    videoDetail['startTime'] = detailItem.connectionStartTime * 1;
    videoDetail['endTime'] = detailItem.connectEndTime ? detailItem.connectEndTime * 1 : this.meetingEndTime;
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
    return videoDetail;
  }

  private parseVoipQuality(lossRate: string, rtts: string): number {
    const lossRate_ = parseFloat(lossRate);
    const latency = _.parseInt(rtts);
    let qualityIndex = Quality.NA;
    if (lossRate_ < QualityRange.LOWER_LOSSRATE && latency < QualityRange.LOWER_LATENCY) {
      qualityIndex = Quality.GOOD;
    } else if (lossRate_ > QualityRange.UPPER_LOSSRATE && latency > QualityRange.UPPER_LATENCY) {
      qualityIndex = Quality.POOR;
    } else {
      qualityIndex = Quality.FAIR;
    }
    return qualityIndex;
  }

  private parseVoipTooltip(lossRate: string, rtts: string, aliasKey?: string): string {
    const lossRate_ = parseFloat(lossRate);
    const qualityIndex = this.parseVoipQuality(lossRate, rtts) - 1;
    const latency = _.parseInt(rtts);
    const items = [{
      key: aliasKey ? this.$translate.instant('webexReports.cmrQuality') : this.$translate.instant('webexReports.voipQuality'),
      value: this.qualityLabels[qualityIndex],
    }, {
      key: this.$translate.instant('webexReports.latency'),
      value: latency > LATENCY_SHOWUP ? `> ${this.$translate.instant('time.capitalized.seconds', { time: 1 }, 'messageformat')}` : `${latency} ms`,
    }, {
      key: this.$translate.instant('webexReports.packetLoss'),
      value: lossRate_ > LOSSRATE_SHOWUP ? '> 10%' : `${_.round(lossRate_, 2)}%`,
    }];
    return this.formatTooltip(items);
  }

  private parseVideoQuality(lossRate: string, rtts: string): number {
    const lossRate_ = parseFloat(lossRate);
    const latency = _.parseInt(rtts);
    let qualityIndex = Quality.NA;
    if (lossRate_ > QualityRange.UPPER_LOSSRATE || latency > QualityRange.UPPER_LATENCY) {
      qualityIndex = Quality.POOR;
    } else {
      qualityIndex = Quality.GOOD;
    }
    return qualityIndex;
  }

  private parseVideoTooltip(lossRate: string, rtts: string, aliasKey?: string): string {
    const qualityIndex = this.parseVideoQuality(lossRate, rtts) - 1;
    const lossRate_ = parseFloat(lossRate);
    const latency = _.parseInt(rtts);
    const items = [{
      key: aliasKey ? this.$translate.instant('webexReports.cmrQuality') : this.$translate.instant('webexReports.videoQuality'),
      value: this.qualityLabels[qualityIndex],
    }, {
      key: this.$translate.instant('webexReports.latency'),
      value: latency > LATENCY_SHOWUP ? `> ${this.$translate.instant('time.capitalized.seconds', { time: 1 }, 'messageformat')}` : `${latency} ms`,
    }, {
      key: this.$translate.instant('webexReports.packetLoss'),
      value: lossRate_ > LOSSRATE_SHOWUP ? '> 10%' : `${_.round(lossRate_, 2)}%`,
    }];
    return this.formatTooltip(items);
  }

  private parsePSTNQuality(audioMos: string): number {
    const mos = _.parseInt(audioMos);
    if (mos >= MosType.GOOD) {
      return Quality.GOOD;
    }
    if (mos >= MosType.FAIR) {
      return Quality.FAIR;
    }
    if (mos >= MosType.POOR) {
      return Quality.POOR;
    }
    return Quality.NA;
  }

  private parsePSTNTooltip(audioMos: string, callType: string): string {
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

  private formatTooltip(msgs: { key: string; value?: string | number; class?: string; }[]): string {
    const tooltip = _.reduce(msgs, (template_, msg) => {
      const cls = msg.class ? msg.class : '';
      const text = msg.value ? `: ${msg.value}` : '';
      return template_ += `<p class="${cls}"><span>${msg.key}</span>${text}</p>`;
    }, '');
    return tooltip;
  }

  private setData(): void {
    if (this.data.currentQos === QosType.VOIP) {
      this.lineData = _.cloneDeep(this.audioLines);
    } else {
      this.lineData = _.cloneDeep(this.videoLines);
    }

    const audioTypes: string[] = [];
    _.forEach(this.audioEnabled, (isEnabled: boolean, key: string) => {
      if (isEnabled) {
        audioTypes.push(key);
      }
    });
    const videoEnabledStr = this.videoEnabled ? this.$translate.instant('common.yes') : this.$translate.instant('common.no');
    this.overview['audioSession'] = audioTypes.join(` ${this.$translate.instant('common.and')} `);
    this.overview['videoSession'] = videoEnabledStr;
  }

  private getAllIds(lines: IParticipant[][]): string {
    let participants: IParticipant[] = [];
    _.forEach(lines, (line: IParticipant[]) => {
      participants = _.concat(participants, line);
    });
    const nodeIds = _.map(participants, (part) => _.get(part, 'nodeId'));
    return _.join(_.union(nodeIds));
  }

  private getFilterIds(participants: IUniqueParticipant[], type: string = QosType.PSTN): string {
    const lineData = type === QosType.PSTN
      ? _.filter(participants, (participant: IUniqueParticipant) => !(participant.sessionType === Platforms.WINDOWS && participant.platform === Platforms.TP))
      : _.filter(participants, (participant: IUniqueParticipant) => participant.sessionType === Platforms.WINDOWS && participant.platform === Platforms.TP);
    const lines = _.map(lineData, (line) => this.formatLines(_.get(line, 'participants')));
    return this.getAllIds(lines);
  }
}

export class DgcPartnerMeetingDetailsComponent implements ng.IComponentOptions {
  public controller = MeetingDetailsController;
  public template = require('modules/core/partnerReports/webexReports/diagnostic/dgc-partner-meeting-details.html');
}