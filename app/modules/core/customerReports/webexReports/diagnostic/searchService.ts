export interface IMeetingDetail {
  meetingBasicInfo: Object;
  features: Object;
  connection: Object;
  sessions: any[];
}

export interface ICallType {
  completed: Boolean;
  description: string;
  items: any[];
}

export interface IUniqueParticipant {
  sessionType: string;
  userId: string;
  guestId: string;
  platform: string;
  browser: string;
  userName: string;
  participants: any[];
}

export interface IParticipant {
  joinTime: number;
  leaveTime: number;
  userName: string;
  duration: number;
  reason: string;
  platform: string;
  browser: string;
  clientIP: string;
  gatewayIP: string;
  userId: string;
  guestId: string;
  conferenceID: string;
  sessionType: string;
  nodeId: string;
}

export interface IJoinTime {
  joinTime: number;
  userName: string;
  userId: string;
  guestId: string;
  joinMeetingTime: string;
  jmtQuality: string;
}

export interface IMeeting {
  conferenceID: string;
  status: number;
  meetingName: string;
  conferenceDate: string;
  startTime: string;
  Duration: string;
  endTime: string;
  meetingType: string;
  meetingNumber: string;
  siteID: number;
  startTime_: string;
  endTime_: string;
  duration: number;
  hostName: string;
  status_: string;
  numberOfParticipants: number;
}

export interface IQos {
  [key: string]: Object;
}

export interface ICallLegs {
  tahoeInfo: Object[];
  videoInfo: Object[];
  voIPInfo: Object[];
}
export interface IServerTime {
  timestamp: number;
}

export class SearchService {
  private url;
  private data: any = {};
  public featureName: string = 'report.webex.diagnostic';
  /* @ngInject */
  constructor(
    private UrlConfig,
    private $http: ng.IHttpService,
    private $translate: ng.translate.ITranslateService,
  ) {
    this.url = `${this.UrlConfig.getGeminiUrl()}`;
  }

  public getMeetings(data): ng.IPromise<IMeeting[]> {
    const url = `${this.url}meetings`;
    return this.$http.post<IMeeting[]>(url, data).then(this.extractData);
  }

  public getMeetingDetail(conferenceID: string): ng.IPromise<IMeetingDetail> {
    const url = `${this.url}meetings/${conferenceID}/meeting-detail`;
    return this.$http.get<IMeetingDetail>(url).then(this.extractData);
  }

  public getUniqueParticipants(conferenceID: string): ng.IPromise<IUniqueParticipant[]> {
    const url = `${this.url}meetings/${conferenceID}/unique-participants`;
    return this.$http.get<IUniqueParticipant[]>(url).then(this.extractData);
  }

  public getParticipants(conferenceID: string): ng.IPromise<IParticipant[]> {
    const url = `${this.url}meetings/${conferenceID}/participants`;
    return this.$http.get<IParticipant[]>(url).then(this.extractData);
  }

  public getPSTNCallInType(conferenceID: string, nodeId: string): ng.IPromise<ICallType> {
    const url = `${this.url}meetings/${conferenceID}/participants/${nodeId}/pstncallintype`;
    return this.$http.get<ICallType>(url).then(this.extractData);
  }

  public getQOS(conferenceID: string, nodeID: string, qosName: string): ng.IPromise<IQos> {
    const url = `${this.url}meetings/${conferenceID}/${qosName}?nodeIds=${nodeID}`;
    return this.$http.get<IQos>(url).then(this.extractData);
  }

  public getCallLegs(conferenceID: string): ng.IPromise<ICallLegs> {
    const url = `${this.url}meetings/${conferenceID}/call-legs`;
    return this.$http.get<ICallLegs>(url).then(this.extractData);
  }

  public getJoinMeetingTime(conferenceID: string): ng.IPromise<IJoinTime> {
    const url = `${this.url}meetings/${conferenceID}/participants/join-meeting-time`;
    return this.$http.get<IJoinTime>(url).then(this.extractData);
  }

  public getServerTime(): ng.IPromise<IServerTime> {
    const url = `${this.url}server`;
    return this.$http.get<IServerTime>(url).then(this.extractData);
  }

  public getStatus(num: number): string {
    const statusArr = ['inProgress', 'ended'];
    return this.$translate.instant('webexReports.meetingStatus.' + statusArr[num - 1]);
  }

  public setStorage(key, val) {
    _.set(this.data, key, val);
    return this.data[key];
  }

  public getStorage(key) {
    return _.get(this.data, key);
  }

  public utcDateByTimezone(date) {
    if (!date) {
      return '';
    }
    const tz = this.getStorage('timeZone');
    const timeZone = tz ? tz : moment.tz.guess();
    const offset = this.getOffset(timeZone);
    return moment.utc(date).utcOffset(offset).format('YYYY-MM-DD hh:mm:ss A');
  }

  public getOffset(timeZone: any): string {
    const tz = timeZone ? timeZone : moment.tz.guess();
    return moment().tz(tz).format('Z');
  }

  public getGuess(tz: string): string {
    return tz ? '' : moment.tz.guess();
  }

  public getNames(tz: string): string | string[] {
    return tz ? '' : moment.tz.names();
  }

  public timestampToDate(timestamp, format): string {
    const tz = this.getStorage('timeZone');
    const timeZone: any = tz ? tz : moment.tz.guess();
    const offset = this.getOffset(timeZone);
    return moment(timestamp).utc().utcOffset(offset).format(format);
  }

  public getBrowser(num) {
    const arr = ['Netscape', 'IE', 'Stand alone application', 'Mozilia', 'Firefox', 'Safari', 'Chrome'];
    return arr[_.parseInt(num)] ? arr[_.parseInt(num)] : 'Other';
  }

  public getPlartform(obj): string {
    if (obj.sessionType === 25) {
      return 'PSTN';
    }
    const key = _.parseInt(obj.platform);
    const arr = ['Windows', 'Mac', 'Solaris', 'Java', 'Linux', 'Flash', 'Javascript', 'iOS', 'MOBILE DEVICE', 'IP Phone', 'Cisco TP', 'BlackBerry', 'WinMobile', 'Android', 'Nokia'];
    return arr[key] ? arr[key] : 'Other';
  }

  public getParticipantEndReson(endReson: string): string {
    if (endReson === null) {
      return '';
    }
    return endReson ? 'Normal' : 'Abnormal';
  }

  public getDevice(obj) {
    const browser = _.parseInt(obj.browser);
    const platform = _.parseInt(obj.platform);
    const sessionType = _.parseInt(obj.sessionType);
    const browser_ = this.getBrowser(browser);
    const platform_ = this.getPlartform(obj);
    if (_.includes([7, 8, 11, 12, 13, 14], platform)) {
      return { icon: 'icon-mobile-phone', name: `Mobile: ${platform_}` };
    }

    if (platform === 10) {
      return { icon: 'icon-devices', name: '' };
    }

    if (platform === 15) {
      return { icon: 'icon-application', name: 'Thin Client' };
    }

    if (sessionType === 25 || platform === 9) {
      return { icon: 'icon-phone', name: 'Phone' };
    }

    if (platform < 7) {
      return browser === 2 ? { icon: 'icon-application', name: 'Client' } : { icon: 'icon-browser', name: `${platform_}: ${browser_}` };
    }

    return { icon: '', name: 'Other' };
  }

  public getRealDevice(conferenceID: string, nodeID: string): ng.IPromise<ICallType> {
    const url = `${this.url}meetings/${conferenceID}/participants/${nodeID}/device`;
    return this.$http.get<ICallType>(url).then(this.extractData);
  }

  public getDuration(duration: number): string {
    if (!duration) {
      return '';
    }
    const hours = moment.duration(duration * 1000).get('hours');
    let minutes: any = moment.duration(duration * 1000).get('minutes');
    let seconds: any = moment.duration(duration * 1000).get('seconds');
    minutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
    seconds = seconds < 10 ? `0${seconds}` : `${seconds}`;

    return hours ? `${hours}:${minutes}:${seconds}` : `${minutes}:${seconds}`;
  }

  private extractData<T>(response: ng.IHttpResponse<T>): T {
    return _.get(response, 'data');
  }
}
