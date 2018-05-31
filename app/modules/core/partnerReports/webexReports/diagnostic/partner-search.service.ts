import { ICallLegs, ICallType, IJoinTime, IMeeting, IMeetingDetail, IServerTime, ISessionDetail, ISessionDetailItem, IParticipant, IObjectDict, IUniqueParticipant, IVersion } from './partner-search.interfaces';

export enum Platforms {
  WINDOWS = '0',
  MAC = '1',
  SOLARIS = '2',
  JAVA = '3',
  LINUX = '4',
  FLASH = '5',
  IPHONE = '7',
  MOBILE_DEVICE = '8',
  IP_PHONE = '9',
  TP = '10',
  BLACK_BERRY = '11',
  WIN_MOBILE = '12',
  ANDROID = '13',
  NOKIA = '14',
  THIN_CLIENT = '15',
  PSTN = '25',
}

export enum Devices {
  WINDOW = 'Windows',
  MAC = 'Mac',
  SOLARIS = 'Solaris',
  JAVA = 'Java',
  LINUX = 'Linux',
  FLASH = 'Flash',
  JAVASCRIPT = 'Javascript',
  IOS = 'iOS',
  MOBILE_DEVICE = 'MOBILE DEVICE',
  IP_PHONE = 'IP Phone',
  CISCO_TP = 'Cisco TP',
  BLACK_BERRY = 'BlackBerry',
  WIN_MOBILE = 'WinMobile',
  ANDROID = 'Android',
  NOKIA = 'Nokia',
  PHONE = 'Phone',
  PSTN = 'PSTN',
}

export enum Browser {
  NETSCAPE = 'Netscape',
  IE = 'IE',
  TP = 'Stand alone application',
  MOZILLA = 'Mozilla',
  FIREFOX = 'Firefox',
  SAFARI = 'Safari',
  CHROME = 'Chrome',
}

export enum Quality {
  GOOD = 1,
  FAIR = 2,
  POOR = 3,
  NA = 4,
}

export enum QualityRange {
  UPPER_LOSSRATE = 5,
  LOWER_LOSSRATE = 3,
  UPPER_LATENCY = 400,
  LOWER_LATENCY = 300,
}

export enum ResponseStatus {
  INPROGRESS = 'inProgress',
  ENDED = 'ended',
}

export class PartnerSearchService {
  private url: string;
  private data = {};
  public featureName = 'partnerReport.webex.diagnostic';
  /* @ngInject */
  constructor(
    private UrlConfig,
    private $http: ng.IHttpService,
    private $translate: ng.translate.ITranslateService,
  ) {
    this.url = `${this.UrlConfig.getDiagnosticUrl()}`;
  }

  public getMeetings(data): ng.IPromise<IMeetingDetail[]> {
    const url = `${this.url}v3/partner/meetings`;
    return this.$http.post<IMeetingDetail[]>(url, data).then(this.extractData);
  }

  public getMeetingDetail(conferenceID: string): ng.IPromise<IMeeting> {
    const url = `${this.url}v3/partner/meetings/${conferenceID}/meeting-detail`;
    return this.$http.get<IMeeting>(url).then(this.extractData);
  }

  public getUniqueParticipants(conferenceID: string): ng.IPromise<IUniqueParticipant[]> {
    const url = `${this.url}v3/partner/meetings/${conferenceID}/unique-participants`;
    return this.$http.get<IUniqueParticipant[]>(url).then(this.extractData);
  }

  public getParticipants(conferenceID: string): ng.IPromise<IParticipant[]> {
    const url = `${this.url}v3/partner/meetings/${conferenceID}/participants`;
    return this.$http.get<IParticipant[]>(url).then(this.extractData);
  }

  public getQOS(conferenceID: string, nodeID: string, qosName: string): ng.IPromise<IObjectDict> {
    const url = `${this.url}v3/partner/meetings/${conferenceID}/${qosName}?nodeIds=${nodeID}`;
    return this.$http.get<IObjectDict>(url).then(this.extractData);
  }

  public getCallLegs(conferenceID: string): ng.IPromise<ICallLegs> {
    const url = `${this.url}v3/partner/meetings/${conferenceID}/call-legs`;
    return this.$http.get<ICallLegs>(url).then(this.extractData);
  }

  public getVoipSessionDetail(conferenceID: string, nodeID: string): ng.IPromise<ISessionDetail> {
    const url = `${this.url}v3/partner/meetings/${conferenceID}/voip-session-detail`;
    return this.$http.post<ISessionDetail>(url, { nodeIds: nodeID }).then(this.extractData);
  }

  public getVideoSessionDetail(conferenceID: string, nodeID: string): ng.IPromise<ISessionDetail> {
    const url = `${this.url}v3/partner/meetings/${conferenceID}/video-session-detail`;
    return this.$http.post<ISessionDetail>(url, { nodeIds: nodeID }).then(this.extractData);
  }

  public getPSTNSessionDetail(conferenceID: string, nodeID: string): ng.IPromise<ISessionDetail> {
    const url = `${this.url}v3/partner/meetings/${conferenceID}/pstn-session-detail`;
    return this.$http.post<ISessionDetail>(url, { nodeIds: nodeID }).then(this.extractData);
  }

  public getCMRSessionDetail(conferenceID: string, nodeID: string): ng.IPromise<ISessionDetail> {
    const url = `${this.url}v3/partner/meetings/${conferenceID}/cmr-session-detail`;
    return this.$http.post<ISessionDetail>(url, { nodeIds: nodeID }).then(this.extractData);
  }

  public getJoinMeetingTime(conferenceID: string): ng.IPromise<IJoinTime[]> {
    const url = `${this.url}v3/partner/meetings/${conferenceID}/participants/join-meeting-time`;
    return this.$http.get<IJoinTime[]>(url).then(this.extractData);
  }

  public getServerTime(): ng.IPromise<IServerTime> {
    const url = `${this.url}v2/server`;
    return this.$http.get<IServerTime>(url).then(this.extractData);
  }

  public getStatus(num: number): string {// TODO share the code next time
    const statusArr = [
      ResponseStatus.INPROGRESS,
      ResponseStatus.ENDED,
    ];
    return this.$translate.instant(`webexReports.meetingStatus.${statusArr[num - 1]}`);
  }

  public setStorage(key: string, val: any) {// TODO share the code next time
    _.set(this.data, key, val);
    return this.data[key];
  }

  public getStorage(key: string): any {// TODO share the code next time
    return _.get(this.data, key);
  }

  public utcDateByTimezone(date: number) {// TODO share the code next time
    if (!date) {
      return '';
    }
    const tz = this.getStorage('timeZone');
    const timeZone = tz ? tz : moment.tz.guess();
    const offset = this.getOffset(timeZone);
    return moment.utc(date).utcOffset(offset).format('YYYY-MM-DD hh:mm:ss A');
  }

  public getOffset(timeZone: any): string {// TODO share the code next time and use better type
    const tz = timeZone ? timeZone : moment.tz.guess();
    return moment().tz(tz).format('Z');
  }

  public getGuess(tz: string): string {
    return tz ? '' : moment.tz.guess();
  }

  public getNames(tz: string): string | string[] {
    return tz ? '' : moment.tz.names();
  }

  public timestampToDate(timestamp: number, format: string): string {// TODO share the code next time
    const tz = this.getStorage('timeZone');
    const timeZone: any = tz ? tz : moment.tz.guess();
    const offset = this.getOffset(timeZone);
    return moment(timestamp).utc().utcOffset(offset).format(format);
  }

  public getBrowser(num: number): string {// TODO share the code next time
    const arr = [
      Browser.NETSCAPE,
      Browser.IE,
      Browser.TP,
      Browser.MOZILLA,
      Browser.FIREFOX,
      Browser.SAFARI,
      Browser.CHROME,
    ];
    return arr[num] ? arr[num] : this.$translate.instant('webexReports.other');
  }

  public getPlatform(obj: any): number | string {// TODO share the code next time
    if (obj.sessionType === Platforms.PSTN) {
      return Devices.PSTN;
    }
    const key = _.parseInt(obj.platform);
    const arr = [
      Devices.WINDOW,
      Devices.MAC,
      Devices.SOLARIS,
      Devices.JAVA,
      Devices.LINUX,
      Devices.FLASH,
      Devices.JAVASCRIPT,
      Devices.IOS,
      Devices.MOBILE_DEVICE,
      Devices.IP_PHONE,
      Devices.CISCO_TP,
      Devices.BLACK_BERRY,
      Devices.WIN_MOBILE,
      Devices.ANDROID,
      Devices.NOKIA,
    ];
    return arr[key] ? arr[key] : this.$translate.instant('webexReports.other');
  }

  public getParticipantEndReason(endReason: string): string {// TODO share the code next time
    if (endReason === null) {
      return '';
    }
    return endReason ? this.$translate.instant('webexReports.normal') : this.$translate.instant('webexReports.abnormal');
  }

  public isMobilePlatform(platform: string): boolean {// TODO share the code next time
    const mobiles = [
      Platforms.IPHONE,
      Platforms.MOBILE_DEVICE,
      Platforms.BLACK_BERRY,
      Platforms.WIN_MOBILE,
      Platforms.ANDROID,
      Platforms.NOKIA,
    ];
    return _.includes(mobiles, platform);
  }

  public getDevice(obj: any): { icon: string, name: string} {// TODO share the code next time and use better type
    const browser = obj.browser;
    const platform = obj.platform;
    const sessionType = obj.sessionType;
    const browser_ = this.getBrowser(browser);
    const platform_ = this.getPlatform(obj);
    if (this.isMobilePlatform(platform)) {
      return {
        icon: 'icon-mobile-phone',
        name: this.$translate.instant('webexReports.mobilePlatform', { platform: platform_ }),
      };
    }

    if (platform === Platforms.TP) {
      return {
        icon: 'icon-devices',
        name: '',
      };
    }

    if (platform === Platforms.THIN_CLIENT) {
      return {
        icon: 'icon-application',
        name: this.$translate.instant('webexReports.thinClient'),
      };
    }

    if (sessionType === Platforms.PSTN || platform === Platforms.IP_PHONE) {
      return {
        icon: 'icon-phone',
        name: this.$translate.instant('webexReports.phone'),
      };
    }

    if (this.isPcPlatform(platform)) {
      return browser === Platforms.SOLARIS ? { icon: 'icon-application', name: this.$translate.instant('mediaFusion.metrics.clients') } : { icon: 'icon-browser', name: `${platform_}: ${browser_}` };
    }

    return { icon: '', name: this.$translate.instant('webexReports.other') };
  }

  public isPcPlatform(platformCode: number): boolean {
    return platformCode < _.parseInt(Platforms.IPHONE);
  }

  public getRealDevice(conferenceID: string, nodeID: string): ng.IPromise<ICallType> {
    const url = `${this.url}v3/partner/meetings/${conferenceID}/participants/${nodeID}/device`;
    return this.$http.get<ICallType>(url).then(this.extractData);
  }

  public getDuration(duration: number): string {// TODO share the code next time
    if (!duration) {
      return '';
    }
    const momentDuration = moment.duration(duration * 1000);
    const days = momentDuration.days();
    let hours = momentDuration.hours();
    if (days > 0) {
      hours += days * 24;
    }
    const minutes = this.prefixZero(momentDuration.minutes());
    const seconds = this.prefixZero(momentDuration.seconds());
    return hours ? `${hours}:${minutes}:${seconds}` : `${minutes}:${seconds}`;
  }

  private prefixZero(data: number): string {
    if (data > 9) {
      return `${data}`;
    } else {
      return `0${data}`;
    }
  }

  private extractData<T>(response: ng.IHttpResponse<T>): T {
    return _.get(response, 'data');
  }

  public toMinOrSec(deltaInMs: number): string {// TODO share the code next time
    if (!deltaInMs) {
      return '';
    }
    let result = '';
    if (deltaInMs) {
      const duration = moment.duration(deltaInMs);
      if (Math.floor(duration.asMinutes())) {
        const minutes = Math.ceil(duration.asMinutes());
        result = this.$translate.instant('time.abbreviatedCap.minutes', { time: minutes }, 'messageformat');
      } else {
        const seconds = Math.floor(duration.asSeconds());
        result = this.$translate.instant('time.abbreviatedCap.seconds', { time: seconds }, 'messageformat');
      }
    }
    return result;
  }

  public getPhoneNumber(phone: string): string {// TODO share the code next time
    if (_.includes(phone, '-') && !_.startsWith(phone, '+')) {
      phone = `+${phone}`;
    }
    return phone;
  }

  public getClientVersion(key: string): IVersion {// TODO share the code next time
    const empty = {
      osVersion: '',
      browserVersion: '',
    };
    const clientVersions = this.getStorage('ClientVersion');
    const clientVersion: IVersion = _.get(clientVersions, key);
    return clientVersion ? clientVersion : empty;
  }

  public getData(): any {// TODO share the code v2.8
    return this.data;
  }

  public saveSessionDetailToStorage(sessionType: string, sessionDetail: ISessionDetailItem): void {
    const sessionDetailByNodeId = {};
    sessionDetailByNodeId[sessionDetail.key] = sessionDetail.items;
    const newDetail = _.assign(this.getStorage(sessionType) || {}, sessionDetailByNodeId);
    this.setStorage(sessionType, newDetail);
  }
}
