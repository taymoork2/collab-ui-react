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

  public getMeetings(data) {
    const url = `${this.url}meetings`;
    return this.$http.post(url, data).then(this.extractData);
  }

  public getMeetingDetail(conferenceID) {
    const url = `${this.url}meetings/${conferenceID}/meeting-detail`;
    return this.$http.get(url).then(this.extractData);
  }

  public getUniqueParticipants(conferenceID) {
    const url = `${this.url}meetings/${conferenceID}/unique-participants`;
    return this.$http.get(url).then(this.extractData);
  }

  public getParticipants(conferenceID) {
    const url = `${this.url}meetings/${conferenceID}/participants`;
    return this.$http.get(url).then(this.extractData);
  }

  public getQOS(conferenceID, nodeID, qosName) {
    const url = `${this.url}meetings/${conferenceID}/${qosName}?nodeIds=${nodeID}`;
    return this.$http.get(url).then(this.extractData);
  }

  public getJoinMeetingTime(conferenceID) {
    const url = `${this.url}meetings/${conferenceID}/participants/join-meeting-time`;
    return this.$http.get(url).then(this.extractData);
  }

  public getServerTime() {
    const url = `${this.url}server`;
    return this.$http.get(url).then(this.extractData);
  }

  public getStatus(num) {
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

  public getOffset(timeZone) {
    const tz = timeZone ? timeZone : moment.tz.guess();
    return moment().tz(tz).format('Z');
  }

  public getGuess(tz) {
    return tz ? '' : moment.tz.guess();
  }

  public getNames(tz) {
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

  public getParticipantEndReson(endReson) {
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
      return { icon: 'icon-devices', name: 'TelePresence' };
    }

    if (sessionType === 25 || platform === 9) {
      return { icon: 'icon-phone', name: 'IP Phone' };
    }

    if (platform < 7) {
      return browser === 2 ? { icon: 'icon-application', name: 'Client' } : { icon: 'icon-browser', name: `${platform_}: ${browser_}` };
    }

    return { icon: '', name: 'Other' };
  }

  public getDuration(duration) {
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

  private extractData(response) {
    return _.get(response, 'data');
  }
}
